"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ItemCategory } from "@prisma/client";
import { useDeleteTrip, useTrip, useUpdateTrip } from "@/hooks/use-trips";
import { useDeleteItemWithUndo, useMoveTripItem, usePendingDeletes, useResolvePlaces, useTripItems } from "@/hooks/use-trip-items";
import { moveDays, type TripItemDTO } from "@/lib/trip-items";
import { daysLabel, type TripDTO } from "@/lib/trips";
import { TripFormSheet } from "@/components/planejar/trip-form-sheet";
import { TripMap } from "./trip-map";
import { Itinerary, type MoveRequest } from "./itinerary";
import { NewItemMenu } from "./new-item-menu";
import { ItemFormSheet } from "./item-form-sheet";

/* eslint-disable @next/next/no-img-element */

/**
 * Tela da Viagem — Figma 180:687: título + duração, mapa, Estimar Gastos /
 * Ver Progresso, filtro de dias e roteiro dia a dia ("Adicione itens neste
 * dia" em todos os dias — feedback do 1º teste de usabilidade).
 */
export function TripScreen({
  initialTrip,
  initialItems,
  openCategory,
}: {
  initialTrip: TripDTO;
  initialItems: TripItemDTO[];
  openCategory?: ItemCategory;
}) {
  const router = useRouter();
  const { data: trip = initialTrip } = useTrip(initialTrip.id, initialTrip);
  const updateTrip = useUpdateTrip(trip.id);
  const deleteTrip = useDeleteTrip(trip.id);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteItem = useDeleteItemWithUndo(initialTrip.id);
  const pendingDeletes = usePendingDeletes();
  const moveItem = useMoveTripItem(initialTrip.id);
  const [dayFilter, setDayFilter] = useState<number | "all">("all");
  const { data: allItems = initialItems } = useTripItems(initialTrip.id, initialItems);
  // Item excluído some na hora; só é apagado de vez quando o aviso "Desfazer" some
  const items = pendingDeletes.size ? allItems.filter((i) => !pendingDeletes.has(i.id)) : allItems;
  useResolvePlaces(initialTrip.id, items); // pinos no mapa e fotos reais dos itens
  const [menuOpen, setMenuOpen] = useState(false);
  const [itemSheet, setItemSheet] = useState<{ category: ItemCategory; item?: TripItemDTO } | null>(
    openCategory ? { category: openCategory } : null,
  );
  // A página pode voltar do cache do Next com o estado antigo: abre o formulário quando ?novo= muda
  const [lastOpenCategory, setLastOpenCategory] = useState(openCategory);
  if (openCategory !== lastOpenCategory) {
    setLastOpenCategory(openCategory);
    if (openCategory) setItemSheet({ category: openCategory });
  }

  const days = Array.from({ length: trip.daysCount }, (_, i) => i + 1);
  const visibleDays = dayFilter === "all" ? days : days.filter((d) => d === dayFilter);
  // Arrastar e soltar: a tela muda na hora; o servidor confirma (ou desfaz, se der erro)
  function onMoveItem({ entry, toDay, order }: MoveRequest) {
    const days = moveDays(entry.item, entry.kind, toDay, trip.daysCount);
    if ("error" in days) {
      toast.error(days.error);
      return false;
    }
    const pos = new Map(order.map((id, i) => [id, i]));
    const optimistic = allItems.map((i) => {
      const moved = i.id === entry.item.id ? { dayNumber: days.dayNumber, endDayNumber: days.endDayNumber } : {};
      return pos.has(i.id) || i.id === entry.item.id ? { ...i, ...moved, position: pos.get(i.id) ?? i.position } : i;
    });
    moveItem.mutate({ itemId: entry.item.id, kind: entry.kind, toDay, order, optimistic });
    return true;
  }

  const comingSoon = (feature: string) => toast(`${feature} chega na próxima etapa do Tripper ✈️`);

  return (
    <main className="relative flex flex-1 flex-col pb-8">
      {/* Topo: voltar · editar */}
      <div className="flex items-center justify-between px-6 pt-16">
        <Link href="/app/planejar" aria-label="Voltar para Planejar">
          <img src="/icons/back.svg" alt="" width={24} height={24} />
        </Link>
        {/* Menu ⋯: editar e excluir são intenções diferentes; excluir fica fora do formulário */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger aria-label="Opções da viagem" className="-m-2 rounded-full p-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <img src="/icons/more.svg" alt="" width={24} height={24} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-auto min-w-[200px] rounded-[12px] p-2">
            <DropdownMenuItem onSelect={() => setEditOpen(true)} className="h-11 gap-3 rounded-[8px] px-3 text-p16 font-medium text-foreground">
              <img src="/icons/edit.svg" alt="" width={24} height={24} />
              Editar viagem
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)} className="h-11 gap-3 rounded-[8px] px-3 text-p16 font-medium">
              <img src="/icons/delete-red.svg" alt="" width={24} height={24} />
              Excluir viagem
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title + Duração */}
      <div className="mt-6 px-6">
        <h1 className="text-h1 leading-[normal] font-semibold tracking-[-0.05em] text-foreground">{trip.name}</h1>
        <p className="text-p16 leading-[1.2] font-medium text-foreground">{daysLabel(trip.daysCount)}</p>
      </div>

      <div className="mt-2">
        <TripMap latitude={trip.latitude} longitude={trip.longitude} items={items} />
      </div>

      {/* Estimar Gastos | Ver Progresso */}
      <div className="relative mt-2 grid h-8 grid-cols-2">
        <Link href={`/app/viagens/${trip.id}/gastos`} className="flex items-center justify-center gap-1">
          <img src="/icons/calculate.svg" alt="" width={24} height={24} />
          <span className="text-p16 leading-[1.2] font-medium text-foreground">Estimar Gastos</span>
        </Link>
        <span aria-hidden className="absolute top-0 left-1/2 h-8 w-px bg-tripper-divider" />
        <button type="button" onClick={() => comingSoon("Ver Progresso")} className="flex items-center justify-center gap-1">
          <img src="/icons/progresso.svg" alt="" width={24} height={24} />
          <span className="text-p16 leading-[1.2] font-medium text-foreground">Ver Progresso</span>
        </button>
      </div>

      {/* Dias visualizados */}
      <div role="tablist" aria-label="Filtrar dias" className="mt-8 flex gap-2 overflow-x-auto px-6 [scrollbar-width:none]">
        <DayChip active={dayFilter === "all"} onClick={() => setDayFilter("all")} icon>
          Todos
        </DayChip>
        {days.map((d) => (
          <DayChip key={d} active={dayFilter === d} onClick={() => setDayFilter(d)}>
            Dia {d}
          </DayChip>
        ))}
      </div>

      {/* Roteiro */}
      <Itinerary
        days={visibleDays}
        items={items}
        cityPhoto={trip.coverImage}
        onOpenItem={(item) => setItemSheet({ category: item.category, item })}
        onDeleteItem={deleteItem}
        onMoveItem={onMoveItem}
        checkMove={(entry, toDay) => {
          const days = moveDays(entry.item, entry.kind, toDay, trip.daysCount);
          return "error" in days ? days.error : null;
        }}
      />

      {/* + Novo item (Figma "Button with icon"); aberto, vira "×" escuro acima do fundo do menu */}
      <div className={cn("pointer-events-none sticky bottom-[104px] mt-auto flex justify-end px-6 pt-8", menuOpen ? "z-[36]" : "z-30")}>
        <Button
          size="fab"
          aria-label={menuOpen ? "Fechar menu de itens" : "Adicionar item ao roteiro"}
          aria-expanded={menuOpen}
          className={cn(
            "pointer-events-auto relative",
            // Abre com o mesmo "Dissolve" de 300ms do menu; fecha na hora
            menuOpen && "bg-tripper-dark-700 transition-colors duration-300 ease-figma-out hover:bg-tripper-dark-700 active:bg-tripper-dark-700",
          )}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <img src="/icons/add-fab.svg" alt="" width={28} height={28} className={cn(menuOpen && "opacity-0 transition-opacity duration-300 ease-figma-out")} />
          <img
            src="/icons/itens/close-white.svg"
            alt=""
            width={28}
            height={28}
            className={cn("absolute", menuOpen ? "opacity-100 transition-opacity duration-300 ease-figma-out" : "opacity-0")}
          />
        </Button>
      </div>

      <NewItemMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onPick={(category) => {
          setMenuOpen(false);
          setItemSheet({ category });
        }}
      />
      <ItemFormSheet
        trip={trip}
        category={itemSheet?.category ?? null}
        item={itemSheet?.item}
        onClose={() => {
          setItemSheet(null);
          // Veio do Estimar Gastos (?novo=...): limpa a URL para não reabrir ao recarregar
          if (openCategory) router.replace(`/app/viagens/${trip.id}`, { scroll: false });
        }}
      />

      <TripFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Editar Viagem"
        submitLabel="Salvar"
        trip={trip}
        pending={updateTrip.isPending}
        onSubmit={async (input) => {
          await updateTrip.mutateAsync(input);
          toast.success("Viagem atualizada");
          router.refresh();
        }}
      />

      <DeleteTripSheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        itemsCount={items.length}
        pending={deleteTrip.isPending}
        onConfirm={async () => {
          try {
            await deleteTrip.mutateAsync();
            setConfirmDelete(false);
            toast.success("Viagem excluída");
            router.replace("/app/planejar");
          } catch {
            toast.error("Não foi possível excluir a viagem.");
          }
        }}
      />
    </main>
  );
}

/**
 * Confirmação para excluir a viagem (Apple HIG: ação destrutiva com "Cancelar" ao lado).
 * Diz o que será perdido e usa vermelho só no botão final.
 */
function DeleteTripSheet({
  open,
  onOpenChange,
  itemsCount,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemsCount: number;
  pending: boolean;
  onConfirm: () => void;
}) {
  const what =
    itemsCount === 0
      ? "A viagem e o valor planejado serão apagados."
      : itemsCount === 1
        ? "O item do roteiro e o valor planejado também serão apagados."
        : `Os ${itemsCount} itens do roteiro e o valor planejado também serão apagados.`;
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="flex flex-col px-6 pt-[31px] pb-8">
          <DrawerTitle className="text-h5 leading-[1.2] font-medium text-foreground">Excluir viagem?</DrawerTitle>
          <DrawerDescription className="mt-2 text-p16 leading-[1.2] text-muted-foreground">
            {what} Não é possível desfazer.
          </DrawerDescription>
          <Button
            size="cta"
            disabled={pending}
            onClick={onConfirm}
            className="mt-8 bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80"
          >
            {pending ? "Excluindo..." : "Excluir viagem"}
          </Button>
          <button type="button" onClick={() => onOpenChange(false)} className="mt-4 self-center p-2 text-p16 font-medium text-foreground">
            Cancelar
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function DayChip({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-end gap-[6px] rounded-[18px] border bg-white text-p14 leading-[1.2] font-medium whitespace-nowrap text-foreground",
        active ? "border-tripper-dark-700" : "border-input",
        icon ? "pt-[6px] pr-[14px] pb-[7px] pl-3" : "px-3 py-2",
      )}
    >
      {icon && <img src="/icons/calendar-chip.svg" alt="" width={20} height={20} />}
      {children}
    </button>
  );
}
