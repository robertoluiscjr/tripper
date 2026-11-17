"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { itemBadgeIcon, itemCardIcon, itemLines, itemPhoto, itineraryForDay, type ItineraryEntry, type TripItemDTO } from "@/lib/trip-items";

/* eslint-disable @next/next/no-img-element */

/** Item arrastado e solto: dia de destino e a nova ordem (ids) desse dia. Retorna false se não deu. */
export type MoveRequest = { entry: ItineraryEntry; toDay: number; order: string[] };

type Columns = Record<number, string[]>; // dia → chaves das entradas, na ordem
const keyOf = (e: ItineraryEntry) => `${e.item.id}:${e.kind}`;
const dayId = (d: number) => `dia-${d}`;
const entryDay = (e: ItineraryEntry) => (e.kind === "end" ? e.item.endDayNumber! : e.item.dayNumber);

const preventDefault = (e: Event) => e.preventDefault();
/**
 * TouchSensor do dnd-kit sem o cancelamento por "resize": no iPhone o Safari dispara resize quando a
 * barra de endereço encolhe ou volta, e o dnd-kit largava o item no meio do arraste. Os demais
 * cancelamentos (toque cancelado pelo sistema, trocar de aba, Esc) continuam.
 */
class StableTouchSensor extends TouchSensor {
  constructor(props: ConstructorParameters<typeof TouchSensor>[0]) {
    super(props);
    const self = this as unknown as {
      windowListeners: { removeAll(): void; add(name: string, fn: (e: Event) => void): void };
      handleCancel: () => void;
    };
    self.windowListeners.removeAll();
    self.windowListeners.add("dragstart", preventDefault);
    self.windowListeners.add("visibilitychange", self.handleCancel);
    self.windowListeners.add("contextmenu", preventDefault);
  }
}

/**
 * Roteiro dia a dia — Figma "Tela da Viagem 2" (2098:2018) e "3" (2109:1868).
 * Cada item: círculo escuro de 40px com o ícone, foto de 64px e 3 linhas de texto (14px Medium).
 * A "Linha do Tempo" (5px, #454545) liga um item ao próximo, inclusive atravessando dias vazios.
 * Item recém-adicionado aparece com dissolve de 250ms (Smart animate do Figma ao salvar).
 * Mover: o ícone "Drag Indicator" (Figma, à direita do item) arrasta o item dentro do dia ou para
 * outro dia — toque, mouse ou teclado (espaço + setas).
 * Excluir: arrastar o item para a esquerda revela a lixeira (padrão "swipe actions" do iOS/Android);
 * a exclusão mostra um aviso com "Desfazer" (hooks/use-trip-items: useDeleteItemWithUndo).
 */
export function Itinerary({
  days,
  items,
  cityPhoto,
  onOpenItem,
  onDeleteItem,
  onMoveItem,
  checkMove,
}: {
  days: number[];
  items: TripItemDTO[];
  /** Foto do destino (capa da viagem): usada na hospedagem sem foto própria */
  cityPhoto?: string | null;
  onOpenItem: (item: TripItemDTO) => void;
  onDeleteItem: (item: TripItemDTO) => void;
  onMoveItem: (move: MoveRequest) => boolean;
  /** Pode soltar esta entrada neste dia? Retorna a mensagem do motivo quando não pode. */
  checkMove: (entry: ItineraryEntry, toDay: number) => string | null;
}) {
  // Itens que chegaram depois da 1ª renderização (acabaram de ser salvos) entram com dissolve
  const [seen, setSeen] = useState(() => new Set(items.map((i) => i.id)));
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  const added = items.filter((i) => !seen.has(i.id));
  if (added.length) {
    setSeen(new Set([...seen, ...added.map((i) => i.id)]));
    setFresh(new Set([...fresh, ...added.map((i) => i.id)]));
  }
  const settle = (id: string) =>
    setFresh((f) => {
      const next = new Set(f);
      next.delete(id);
      return next;
    });

  const byDay = new Map(days.map((d) => [d, itineraryForDay(items, d)]));
  const entryByKey = new Map([...byDay.values()].flat().map((e) => [keyOf(e), e]));

  // Durante o arraste a tela usa este rascunho; depois de soltar, espera a lista nova chegar
  const [draft, setDraft] = useState<Columns | null>(null);
  const [droppedOn, setDroppedOn] = useState<TripItemDTO[] | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  // Dia em que o item não pode entrar (ex.: check-in no dia do check-out): aviso antes de soltar
  const [blocked, setBlocked] = useState<{ day: number; message: string } | null>(null);
  if (droppedOn && items !== droppedOn) {
    setDroppedOn(null);
    setDraft(null);
  }
  const columns: Columns = draft ?? Object.fromEntries(days.map((d) => [d, (byDay.get(d) ?? []).map(keyOf)]));
  const findDay = (id: UniqueIdentifier) => {
    const s = String(id);
    if (s.startsWith("dia-")) return Number(s.slice(4));
    return days.find((d) => columns[d]?.includes(s));
  };

  // Dias (de toda a viagem) que têm itens — para saber se a linha continua antes/depois de cada dia
  const allDays = Array.from(new Set(items.flatMap((i) => [i.dayNumber, ...(i.endDayNumber ? [i.endDayNumber] : [])])));
  const hasBefore = (d: number) => allDays.some((x) => x < d);
  const hasAfter = (d: number) => allDays.some((x) => x > d);

  const dndId = useId(); // ids estáveis entre servidor e navegador (acessibilidade do arraste)

  // iPhone: segurar o dedo no ícone de arrastar abria o menu do Safari ("Salvar no App Fotos") e
  // rolava a página antes do arraste começar. preventDefault no "touchstart" desliga esses gestos
  // do sistema — mas na janela (fim da propagação), depois de o dnd-kit já ter registrado o toque:
  // ele ignora toques que chegam com defaultPrevented.
  useEffect(() => {
    const block = (e: TouchEvent) => {
      if (e.cancelable && (e.target as Element | null)?.closest?.("[data-drag-handle]")) e.preventDefault();
    };
    window.addEventListener("touchstart", block, { passive: false });
    return () => window.removeEventListener("touchstart", block);
  }, []);
  // Só o ícone "Drag Indicator" arrasta — mouse, toque ou teclado —, igual em todos os aparelhos.
  // O resto do item fica para tocar (editar), rolar a página e deslizar para excluir.
  // TouchSensor (e não PointerSensor): no celular o navegador cancelava o gesto para rolar a página.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(StableTouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragStart({ active, activatorEvent }: DragStartEvent) {
    setActiveKey(String(active.id));
    setDraft(columns);
    // Toque: uma vibração curta confirma que o item "levantou" (Android; o iPhone ignora)
    if (typeof TouchEvent !== "undefined" && activatorEvent instanceof TouchEvent) navigator.vibrate?.(10);
  }

  // Passou para outro dia: o item entra na lista daquele dia (na posição sob o dedo)
  function onDragOver({ active, over }: DragOverEvent) {
    if (!over || !draft) return;
    const from = findDay(active.id);
    const to = findDay(over.id);
    if (from === undefined || to === undefined) return;
    const entry = entryByKey.get(String(active.id));
    const problem = entry && to !== entryDay(entry) ? checkMove(entry, to) : null;
    if (problem) {
      if (blocked?.day !== to) setBlocked({ day: to, message: problem });
      return; // não entra nesse dia
    }
    if (blocked && blocked.day !== to) setBlocked(null);
    if (from === to) return;
    setDraft((prev) => {
      if (!prev) return prev;
      const key = String(active.id);
      const target = prev[to].filter((k) => k !== key);
      const overIndex = target.indexOf(String(over.id));
      target.splice(overIndex >= 0 ? overIndex : target.length, 0, key);
      return { ...prev, [from]: prev[from].filter((k) => k !== key), [to]: target };
    });
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveKey(null);
    // Soltou sobre um dia não permitido: volta ao lugar e explica o motivo
    if (blocked && over && findDay(over.id) === blocked.day) {
      toast.error(blocked.message);
      setBlocked(null);
      return setDraft(null);
    }
    setBlocked(null);
    const key = String(active.id);
    const entry = entryByKey.get(key);
    const to = findDay(active.id);
    if (!draft || !entry || to === undefined) return setDraft(null);
    let column = draft[to];
    const overIndex = over ? column.indexOf(String(over.id)) : -1;
    if (overIndex >= 0) column = arrayMove(column, column.indexOf(key), overIndex);
    const final = { ...draft, [to]: column };

    const order = column.map((k) => entryByKey.get(k)!.item.id);
    const before = (byDay.get(to) ?? []).map((e) => e.item.id);
    const changed = to !== entryDay(entry) || order.join() !== before.join();
    if (changed && onMoveItem({ entry, toDay: to, order })) {
      setDraft(final);
      setDroppedOn(items); // mantém o rascunho até a lista nova chegar (sem "piscar")
    } else setDraft(null);
  }

  const label = (id: UniqueIdentifier) => itemLines(entryByKey.get(String(id))!).title;
  const where = (id: UniqueIdentifier) => {
    const d = findDay(id);
    if (d === undefined) return "";
    const pos = columns[d].indexOf(String(id));
    return pos >= 0 ? `Dia ${d}, posição ${pos + 1} de ${columns[d].length}` : `Dia ${d}`;
  };
  const announcements: Announcements = {
    onDragStart: ({ active }) => `${label(active.id)} selecionado. ${where(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${label(active.id)}: ${where(active.id)}.` : `${label(active.id)} fora do roteiro.`),
    onDragEnd: ({ active, over }) => (over ? `${label(active.id)} solto. ${where(active.id)}.` : `${label(active.id)} voltou ao lugar.`),
    onDragCancel: ({ active }) => `Movimento cancelado. ${label(active.id)} voltou ao lugar.`,
  };
  const activeEntry = activeKey ? entryByKey.get(activeKey) : undefined;

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActiveKey(null);
        setDraft(null);
        setBlocked(null);
      }}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            "Para mover o item, pressione espaço ou Enter. Use as setas para cima e para baixo para escolher o lugar e pressione espaço ou Enter de novo para soltar. Esc cancela.",
        },
      }}
    >
      <ol className="mt-[30px] flex flex-col gap-6 px-6">
        {days.map((d, i) => {
          const entries = (columns[d] ?? []).map((k) => entryByKey.get(k)!).filter(Boolean);
          const last = i === days.length - 1;
          const dragging = activeKey !== null; // a linha do tempo some enquanto arrasta
          return (
            <DayDrop key={d} day={d} className={cn("relative flex flex-col", !last && "border-b border-tripper-divider pb-6")}>
              <h2 className="text-h3 leading-[1.2] font-medium text-foreground">Dia {d}</h2>
              {blocked?.day === d && (
                <p role="alert" className="mt-2 flex items-center gap-1 text-p14 leading-[1.2] font-medium text-destructive">
                  <img src="/icons/block-red.svg" alt="" width={20} height={20} />
                  {blocked.message}
                </p>
              )}
              <SortableContext id={dayId(d)} items={columns[d] ?? []} strategy={verticalListSortingStrategy}>
                {entries.length === 0 ? (
                  <>
                    <p className="mt-2 text-p16 leading-[1.2] text-muted-foreground">
                      {!dragging ? "Adicione itens neste dia" : blocked?.day === d ? "" : "Solte aqui para mover para este dia"}
                    </p>
                    {!dragging && hasBefore(d) && hasAfter(d) && !last && <Line className="-bottom-6 h-10" />}
                  </>
                ) : (
                  <ul className="mt-4 flex flex-col gap-8">
                    {entries.map((entry, j) => (
                      <SortableEntry
                        key={keyOf(entry)}
                        id={keyOf(entry)}
                        label={itemLines(entry).title}
                        className={cn(fresh.has(entry.item.id) && "animate-in duration-250 ease-figma-out fade-in")}
                        onAnimationEnd={() => settle(entry.item.id)}
                      >
                        {(handle) => (
                          <>
                            {!dragging && j === 0 && hasBefore(d) && <Line className="-top-3 h-[25px]" />}
                            {!dragging &&
                              (j < entries.length - 1 ? (
                                <Line className="top-[50px] h-[60px]" />
                              ) : (
                                hasAfter(d) && !last && <Line className="top-[52px] h-[61px]" />
                              ))}
                            <SwipeToDelete label={`Excluir ${entry.item.title}`} onDelete={() => onDeleteItem(entry.item)} disabled={dragging}>
                              <ItemRow entry={entry} cityPhoto={cityPhoto} onOpen={() => onOpenItem(entry.item)} handle={handle} />
                            </SwipeToDelete>
                          </>
                        )}
                      </SortableEntry>
                    ))}
                  </ul>
                )}
              </SortableContext>
            </DayDrop>
          );
        })}
      </ol>
      {/* O item "levantado" acompanha o dedo, com sombra */}
      <DragOverlay dropAnimation={{ duration: 250, easing: "cubic-bezier(0, 0, 0.58, 1)" }}>
        {activeEntry && (
          // Fica sob o dedo enquanto arrasta: sem receber toque nem oferecer imagens ao menu do iPhone
          <div className={cn("pointer-events-none rounded-[12px] bg-white shadow-[0px_4px_16px_0px_rgba(0,0,0,0.2)] select-none", NO_TOUCH_MENU)}>
            <ItemRow entry={activeEntry} cityPhoto={cityPhoto} handle={<DragIcon />} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

/**
 * Sem o menu de toque longo do iPhone ("Salvar no App Fotos", "Copiar Objeto"), sem seleção de texto
 * e sem o "arrastar imagem" nativo: as fotos e ícones do item não recebem o toque.
 */
const NO_TOUCH_MENU =
  "[-webkit-touch-callout:none] [-webkit-user-select:none] [&_img]:pointer-events-none [&_img]:[-webkit-touch-callout:none] [&_img]:[-webkit-user-drag:none]";

/** O dia inteiro aceita o item (inclusive dias vazios). */
function DayDrop({ day, className, children }: { day: number; className?: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: dayId(day) });
  return (
    <li ref={setNodeRef} className={className}>
      {children}
    </li>
  );
}

function SortableEntry({
  id,
  label,
  className,
  onAnimationEnd,
  children,
}: {
  id: string;
  label: string;
  className?: string;
  onAnimationEnd: () => void;
  children: (handle: React.ReactNode) => React.ReactNode;
}) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id });
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      data-drag-handle
      {...attributes}
      onMouseDown={(e) => listeners?.onMouseDown?.(e)}
      onTouchStart={(e) => listeners?.onTouchStart?.(e)}
      onKeyDown={(e) => listeners?.onKeyDown?.(e)}
      aria-label={`Mover ${label}`}
      // Não deixa o gesto de "arrastar para excluir" começar pelo ícone
      onPointerDown={(e) => e.stopPropagation()}
      // Área de toque de 44px (HIG 44pt / Material 48dp) em volta do ícone de 24px
      className="relative flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-[4px] outline-none before:absolute before:-inset-[10px] focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
    >
      <DragIcon />
    </button>
  );
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("relative", NO_TOUCH_MENU, isDragging && "opacity-30", className)}
      onAnimationEnd={(e) => e.target === e.currentTarget && onAnimationEnd()}
    >
      {children(handle)}
    </li>
  );
}

/**
 * "Drag Indicator (W200)" do Figma — 24px, #696969. Desenhado em SVG no próprio código (e não
 * <img>): no iPhone, segurar o dedo numa imagem abre o menu do Safari ("Salvar no App Fotos",
 * "Copiar Objeto") e o arraste não começa.
 */
const DRAG_PATH = "M8.99982 19.2307C8.66135 19.2307 8.37161 19.1102 8.13059 18.8692C7.88956 18.6281 7.76904 18.3384 7.76904 17.9999C7.76904 17.6615 7.88956 17.3717 8.13059 17.1307C8.37161 16.8897 8.66135 16.7692 8.99982 16.7692C9.33828 16.7692 9.62803 16.8897 9.86904 17.1307C10.1101 17.3717 10.2306 17.6615 10.2306 17.9999C10.2306 18.3384 10.1101 18.6281 9.86904 18.8692C9.62803 19.1102 9.33828 19.2307 8.99982 19.2307ZM14.9998 19.2307C14.6614 19.2307 14.3716 19.1102 14.1306 18.8692C13.8896 18.6281 13.769 18.3384 13.769 17.9999C13.769 17.6615 13.8896 17.3717 14.1306 17.1307C14.3716 16.8897 14.6614 16.7692 14.9998 16.7692C15.3383 16.7692 15.628 16.8897 15.869 17.1307C16.1101 17.3717 16.2306 17.6615 16.2306 17.9999C16.2306 18.3384 16.1101 18.6281 15.869 18.8692C15.628 19.1102 15.3383 19.2307 14.9998 19.2307ZM8.99982 13.2307C8.66135 13.2307 8.37161 13.1102 8.13059 12.8692C7.88956 12.6281 7.76904 12.3384 7.76904 11.9999C7.76904 11.6615 7.88956 11.3717 8.13059 11.1307C8.37161 10.8897 8.66135 10.7692 8.99982 10.7692C9.33828 10.7692 9.62803 10.8897 9.86904 11.1307C10.1101 11.3717 10.2306 11.6615 10.2306 11.9999C10.2306 12.3384 10.1101 12.6281 9.86904 12.8692C9.62803 13.1102 9.33828 13.2307 8.99982 13.2307ZM14.9998 13.2307C14.6614 13.2307 14.3716 13.1102 14.1306 12.8692C13.8896 12.6281 13.769 12.3384 13.769 11.9999C13.769 11.6615 13.8896 11.3717 14.1306 11.1307C14.3716 10.8897 14.6614 10.7692 14.9998 10.7692C15.3383 10.7692 15.628 10.8897 15.869 11.1307C16.1101 11.3717 16.2306 11.6615 16.2306 11.9999C16.2306 12.3384 16.1101 12.6281 15.869 12.8692C15.628 13.1102 15.3383 13.2307 14.9998 13.2307ZM8.99982 7.23072C8.66135 7.23072 8.37161 7.1102 8.13059 6.86917C7.88956 6.62815 7.76904 6.33841 7.76904 5.99994C7.76904 5.66147 7.88956 5.37173 8.13059 5.13072C8.37161 4.88968 8.66135 4.76917 8.99982 4.76917C9.33828 4.76917 9.62803 4.88968 9.86904 5.13072C10.1101 5.37173 10.2306 5.66147 10.2306 5.99994C10.2306 6.33841 10.1101 6.62815 9.86904 6.86917C9.62803 7.1102 9.33828 7.23072 8.99982 7.23072ZM14.9998 7.23072C14.6614 7.23072 14.3716 7.1102 14.1306 6.86917C13.8896 6.62815 13.769 6.33841 13.769 5.99994C13.769 5.66147 13.8896 5.37173 14.1306 5.13072C14.3716 4.88968 14.6614 4.76917 14.9998 4.76917C15.3383 4.76917 15.628 4.88968 15.869 5.13072C16.1101 5.37173 16.2306 5.66147 16.2306 5.99994C16.2306 6.33841 16.1101 6.62815 15.869 6.86917C15.628 7.1102 15.3383 7.23072 14.9998 7.23072Z";
function DragIcon() {
  return (
    <svg aria-hidden width={24} height={24} viewBox="0 0 24 24" className="pointer-events-none text-muted-foreground">
      <path d={DRAG_PATH} fill="currentColor" />
    </svg>
  );
}

const REVEAL = 80; // largura da área vermelha com a lixeira
const FULL_SWIPE = 180; // arrastar até aqui e soltar exclui direto

/**
 * Arrastar para a esquerda (toque ou mouse) revela "Excluir". Soltar depois da metade deixa aberto;
 * arrastar longe exclui direto. Tocar fora (ou no próprio item) fecha. Pelo teclado, o botão
 * aparece ao receber foco (Tab).
 */
function SwipeToDelete({ label, onDelete, disabled, children }: { label: string; onDelete: () => void; disabled?: boolean; children: React.ReactNode }) {
  const [offset, setOffsetState] = useState(0);
  const offsetRef = useRef(0); // valor atual mesmo antes de renderizar (move e solta no mesmo quadro)
  const setOffset = (v: number) => {
    offsetRef.current = v;
    setOffsetState(v);
  };
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; base: number; axis?: "x" | "y" } | null>(null);
  const swallowClick = useRef(false);
  const open = offset !== 0;

  // Deslizar na horizontal: bloqueia a rolagem do navegador (que cancelaria o gesto). Antes isso era
  // "touch-action: pan-y", mas no iPhone essa regra deixava o Safari rolar a página mesmo com o item
  // já levantado para mudar de dia (o arraste só funcionava começando para a esquerda).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: TouchEvent) => {
      const d = drag.current;
      const t = e.touches[0];
      if (!d || !t || !e.cancelable) return;
      const dx = Math.abs(t.clientX - d.x);
      if (d.axis === "x" || (!d.axis && dx > 3 && dx > Math.abs(t.clientY - d.y))) e.preventDefault();
    };
    el.addEventListener("touchmove", onMove, { passive: false });
    return () => el.removeEventListener("touchmove", onMove);
  }, []);

  // Aberto: tocar em qualquer outro lugar fecha
  useEffect(() => {
    if (!open || dragging) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOffset(0);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open, dragging]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden select-none"
      onDragStart={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        drag.current = { x: e.clientX, y: e.clientY, base: offsetRef.current };
        swallowClick.current = false;
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        // O item foi "levantado" para mudar de dia: o deslizar para excluir sai do caminho
        if (disabled) {
          drag.current = null;
          if (dragging) setDragging(false);
          if (offsetRef.current) setOffset(0);
          return;
        }
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        if (!d.axis) {
          if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
            d.axis = "x";
            try {
              e.currentTarget.setPointerCapture(e.pointerId); // continua recebendo o arraste fora do item
            } catch {}
            setDragging(true);
          } else if (Math.abs(dy) > 8) d.axis = "y";
        }
        if (d.axis === "x") {
          swallowClick.current = true;
          setOffset(Math.min(0, Math.max(-(FULL_SWIPE + 40), d.base + dx)));
        }
      }}
      onPointerUp={() => {
        const d = drag.current;
        drag.current = null;
        if (d?.axis !== "x") return;
        setDragging(false);
        const end = offsetRef.current;
        if (end <= -FULL_SWIPE) {
          setOffset(0);
          onDelete();
        } else setOffset(end < -REVEAL / 2 ? -REVEAL : 0);
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDragging(false);
        setOffset(0);
      }}
      onClickCapture={(e) => {
        // Clique que terminou um arraste, ou toque no item aberto (fecha em vez de editar)
        const onAction = (e.target as HTMLElement).closest("[data-swipe-action]");
        if (swallowClick.current || (open && !onAction)) {
          e.stopPropagation();
          e.preventDefault();
          swallowClick.current = false;
          if (!onAction) setOffset(0);
        }
      }}
    >
      {/* Ação revelada: cresce com o arraste, ancorada à direita */}
      <div className="absolute inset-y-0 right-0 flex justify-end overflow-hidden rounded-[8px] bg-destructive" style={{ width: Math.max(0, -offset) }}>
        <button
          type="button"
          data-swipe-action
          aria-label={label}
          onFocus={() => setOffset(-REVEAL)}
          onBlur={() => !dragging && setOffset(0)}
          onClick={() => {
            setOffset(0);
            onDelete();
          }}
          className="flex h-full w-20 shrink-0 flex-col items-center justify-center gap-1 text-small leading-none font-medium text-white"
        >
          <img src="/icons/delete-white.svg" alt="" width={24} height={24} />
          Excluir
        </button>
      </div>
      <div
        className={cn(!dragging && "transition-transform duration-250 ease-figma-out motion-reduce:transition-none")}
        style={{ transform: offset ? `translateX(${offset}px)` : undefined }}
      >
        {children}
      </div>
    </div>
  );
}

function Line({ className }: { className?: string }) {
  return <span aria-hidden className={cn("absolute left-[25.5px] w-[5px] bg-tripper-dark-700", className)} />;
}

/** "Item do roteiro" (Figma 2109:1874): o toque abre o item; o "Drag Indicator" fica à direita. */
function ItemRow({
  entry,
  cityPhoto,
  onOpen,
  handle,
}: {
  entry: ItineraryEntry;
  cityPhoto?: string | null;
  onOpen?: () => void;
  handle?: React.ReactNode;
}) {
  const { item } = entry;
  const lines = itemLines(entry);
  const photo = itemPhoto(item, cityPhoto);

  return (
    <div className="relative flex h-16 w-full items-center">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Editar ${lines.title}`}
        tabIndex={onOpen ? undefined : -1}
        className="flex h-16 min-w-0 flex-1 items-center pl-2 text-left"
      >
        <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-tripper-dark-700">
          <img src={itemBadgeIcon(item)} alt="" width={24} height={24} />
        </span>
        <span className="ml-6 flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-tripper-light-300">
          {photo ? (
            <img src={photo} alt="" width={64} height={64} className="size-full object-cover" />
          ) : (
            <img src={itemCardIcon(item)} alt="" width={32} height={32} />
          )}
        </span>
        <span className="ml-4 flex min-w-0 flex-1 flex-col gap-1 self-start pt-[3px] text-p14 leading-[1.2] font-medium text-muted-foreground">
          <span className="truncate">{lines.title}</span>
          {lines.route ? (
            <Pair values={lines.route} />
          ) : (
            lines.second && <span className="truncate">{lines.second}</span>
          )}
          {lines.times ? <Pair values={lines.times} /> : lines.third && <span className="truncate">{lines.third}</span>}
        </span>
      </button>
      {handle}
    </div>
  );
}

/** "SSA → SDU" / "08:00 → 10:00" com a seta do Figma. */
function Pair({ values: [a, b] }: { values: [string, string] }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="truncate">{a}</span>
      <img src="/icons/itens/arrow.svg" alt="para" width={17} height={8} className="shrink-0" />
      <span className="truncate">{b}</span>
    </span>
  );
}
