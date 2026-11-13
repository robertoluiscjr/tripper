"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { ItemCategory, TransportMode } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { ApiError } from "@/hooks/use-trips";
import { useSaveTripItem } from "@/hooks/use-trip-items";
import { tripItemSchema, type TripItemInput } from "@/lib/validations";
import { TRANSPORT_MODES, formatMoney, inputFromItem, parseMoney, transportLabel, type TripItemDTO } from "@/lib/trip-items";
import type { TripDTO } from "@/lib/trips";

/* eslint-disable @next/next/no-img-element */

type Values = Record<string, string>;

/** Campos de cada formulário, na ordem do Figma (campo a cada 48px). */
type Field =
  | { kind: "text"; name: "title" | "carrier" | "code" | "originName" | "destinationName" | "address" | "notes"; label: string }
  | { kind: "money"; label: string }
  | { kind: "when"; prefix: "start" | "end"; label: string; timeLabel: string };

type FormSpec = { title: string; fields: Field[]; help?: { text: string; href: string } };

const text = (name: Extract<Field, { kind: "text" }>["name"], label: string): Field => ({ kind: "text", name, label });
const when = (prefix: "start" | "end", label: string, timeLabel = "Horário"): Field => ({ kind: "when", prefix, label, timeLabel });
const cost: Field = { kind: "money", label: "Custo" };
const notes = text("notes", "Anotações");

function formSpec(category: ItemCategory, mode?: TransportMode): FormSpec {
  switch (category) {
    case "TRANSPORT":
      if (mode === "PLANE")
        // Figma "Voo" (195:532)
        return {
          title: "Voo",
          fields: [
            text("carrier", "Companhia Aérea"),
            text("code", "Número do Voo"),
            text("originName", "Aeroporto de Origem*"),
            when("start", "Partida*", "Horário*"),
            text("destinationName", "Aeroporto de Destino*"),
            when("end", "Chegada*", "Horário*"),
            cost,
            notes,
          ],
          help: { text: "Ainda não comprou a passagem?", href: "/app/buscar" },
        };
      if (mode === "OWN_CAR")
        return {
          title: "Carro próprio",
          fields: [text("originName", "Local de Origem*"), when("start", "Partida*", "Horário*"), text("destinationName", "Local de Destino*"), when("end", "Chegada*", "Horário*"), cost, notes],
        };
      return {
        title: transportLabel(mode),
        fields: [
          text("carrier", "Empresa"),
          text("code", "Número da Reserva"),
          text("originName", "Local de Origem*"),
          when("start", "Partida*", "Horário*"),
          text("destinationName", "Local de Destino*"),
          when("end", "Chegada*", "Horário*"),
          cost,
          notes,
        ],
        help: { text: "Ainda não comprou a passagem?", href: "/app/buscar" },
      };
    case "ACCOMMODATION":
      // Figma "Acomodação" (195:828)
      return {
        title: "Acomodação",
        fields: [text("title", "Nome da Acomodação"), text("address", "Endereço"), when("start", "Chegada*"), when("end", "Saída*"), cost, notes],
        help: { text: "Ainda não possui hospedagem?", href: "/app/buscar" },
      };
    case "CAR_RENTAL":
      return {
        title: "Aluguel de Carro",
        fields: [text("title", "Locadora*"), text("address", "Local de Retirada"), when("start", "Retirada*"), when("end", "Devolução*"), cost, notes],
      };
    case "TOUR":
      return {
        title: "Passeios e Atrações",
        fields: [text("title", "Nome do Passeio*"), text("address", "Endereço"), when("start", "Data*"), cost, notes],
        help: { text: "Procurando o que fazer?", href: "/app/buscar" },
      };
    case "FOOD":
      return { title: "Comer e Beber", fields: [text("title", "Nome do Lugar*"), text("address", "Endereço"), when("start", "Data*"), cost, notes] };
    case "CUSTOM":
      return { title: "Atividade Personalizada", fields: [text("title", "Nome da Atividade*"), text("address", "Endereço"), when("start", "Data*"), cost, notes] };
  }
}

export function ItemFormSheet({
  trip,
  category,
  item,
  prefill,
  onClose,
}: {
  trip: TripDTO;
  /** Categoria escolhida no menu "Novo Item" (null = fechado) */
  category: ItemCategory | null;
  /** Item existente (editar) */
  item?: TripItemDTO | null;
  /** Item novo já preenchido (ex.: "Adicionar à viagem" da aba Buscar: nome e endereço do passeio) */
  prefill?: { title?: string; address?: string };
  onClose: () => void;
}) {
  const open = !!category;
  // Mantém o formulário na tela enquanto o sheet sai (antes ele esvaziava durante a animação)
  const [shown, setShown] = useState<{ category: ItemCategory; item?: TripItemDTO | null } | null>(category ? { category, item } : null);
  // Salvou/excluiu: no Figma o sheet sai com "Smart animate" (dissolve); arrastar/fechar continua descendo
  const [fadeExit, setFadeExit] = useState(false);
  if (category && (category !== shown?.category || item !== shown?.item)) {
    setShown({ category, item });
    setFadeExit(false);
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent data-exit={fadeExit ? "fade" : undefined}>
        <AnimatedHeight>
          {shown && (
            <ItemForm
              key={shown.item?.id ?? shown.category}
              trip={trip}
              category={shown.category}
              item={shown.item ?? undefined}
              prefill={shown.item ? undefined : prefill}
              onDone={() => {
                setFadeExit(true);
                onClose();
              }}
            />
          )}
        </AnimatedHeight>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * "Smart animate" de 250ms (Ease out) do protótipo: quando o conteúdo do sheet muda de tamanho
 * (abrir "Tipos de Transporte", trocar para o formulário Voo), a altura acompanha suavemente.
 */
function AnimatedHeight({ children }: { children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      style={{ height }}
      className={cn("shrink-0 overflow-hidden", height !== undefined && "transition-[height] duration-250 ease-figma-out motion-reduce:transition-none")}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

function ItemForm({
  trip,
  category,
  item,
  prefill,
  onDone,
}: {
  trip: TripDTO;
  category: ItemCategory;
  item?: TripItemDTO;
  prefill?: { title?: string; address?: string };
  onDone: () => void;
}) {
  const [mode, setMode] = useState<TransportMode | undefined>(item?.transportMode ?? undefined);
  const [values, setValues] = useState<Values>(() =>
    item ? (inputFromItem(item, trip.startDate) as Values) : prefill ? ({ title: prefill.title ?? "", address: prefill.address ?? "" } as Values) : {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Veio da lista "Tipos de Transporte": o formulário entra com dissolve (Smart animate do Figma)
  const [picked, setPicked] = useState(false);
  const save = useSaveTripItem(trip.id, item?.id);

  // "Transportes": primeiro escolhe o tipo (Figma 192:316 · 2062:1662)
  if (category === "TRANSPORT" && !mode) return (
      <TransportPicker
        onPick={(m) => {
          setMode(m);
          setPicked(true);
        }}
      />
    );

  const spec = formSpec(category, mode);
  const set = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    // Preencheu: some a mensagem de erro daquele campo (dia por número usa o erro do campo de data)
    const key = name.replace(/Day$/, "Date");
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  };
  const byDates = !!trip.startDate;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const costValue = values.cost ? parseMoney(values.cost) : undefined;
    const input: TripItemInput = {
      category,
      transportMode: category === "TRANSPORT" ? mode : undefined,
      title: values.title || undefined,
      carrier: values.carrier || undefined,
      code: values.code || undefined,
      originName: values.originName || undefined,
      destinationName: values.destinationName || undefined,
      address: values.address || undefined,
      startDate: byDates ? values.startDate || undefined : undefined,
      startDay: !byDates && values.startDay ? Number(values.startDay) : undefined,
      startTime: values.startTime || undefined,
      endDate: byDates ? values.endDate || undefined : undefined,
      endDay: !byDates && values.endDay ? Number(values.endDay) : undefined,
      endTime: values.endTime || undefined,
      cost: costValue,
      notes: values.notes || undefined,
    };
    const parsed = tripItemSchema.safeParse(input);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      // Dia vem como data ou número: o erro aparece no mesmo campo
      if (next.startDay) next.startDate ??= next.startDay;
      if (next.endDay) next.endDate ??= next.endDay;
      setErrors(next);
      return;
    }
    setErrors({});
    try {
      await save.mutateAsync(parsed.data);
      toast.success(item ? "Item atualizado" : "Item adicionado ao roteiro");
      onDone();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Não foi possível salvar o item.");
    }
  }

  // Diárias (Figma: "R$ 1.450,00 (5 diárias)")
  const nights =
    category === "ACCOMMODATION"
      ? dayIndex(values, "end", byDates, trip) - dayIndex(values, "start", byDates, trip)
      : 0;

  return (
    <form
      onSubmit={submit}
      noValidate
      className={cn("flex flex-col px-6 pt-[31px] pb-10", picked && "animate-in duration-250 ease-figma-out fade-in")}
    >
      <DrawerTitle className="text-h5 leading-[1.2] font-medium text-foreground">{spec.title}</DrawerTitle>
      <DrawerDescription className="sr-only">Preencha os dados do item do roteiro</DrawerDescription>

      <div className="mt-8 flex flex-col gap-6">
        {spec.fields.map((field) => {
          if (field.kind === "text")
            return (
              <FieldBox key={field.name} error={errors[field.name]}>
                <Input
                  aria-label={field.label.replace("*", "")}
                  placeholder={field.label}
                  value={values[field.name] ?? ""}
                  onChange={(e) => set(field.name, e.target.value)}
                  aria-invalid={!!errors[field.name]}
                  maxLength={field.name === "notes" ? 2000 : 120}
                />
              </FieldBox>
            );
          if (field.kind === "money")
            return (
              <FieldBox key="cost" error={errors.cost}>
                <div className="relative">
                  <Input
                    aria-label="Custo"
                    placeholder={field.label}
                    inputMode="decimal"
                    value={values.cost ?? ""}
                    onChange={(e) => set("cost", e.target.value)}
                    onBlur={() => {
                      const n = values.cost ? parseMoney(values.cost) : undefined;
                      if (n !== undefined && !Number.isNaN(n)) set("cost", formatMoney(n));
                    }}
                    aria-invalid={!!errors.cost}
                  />
                  {nights > 0 && values.cost && (
                    <span className="pointer-events-none absolute top-0 right-0 text-p16 leading-[1.2] text-muted-foreground">
                      ({nights} {nights === 1 ? "diária" : "diárias"})
                    </span>
                  )}
                </div>
              </FieldBox>
            );
          const p = field.prefix;
          return (
            <div key={p} className="flex gap-6">
              <FieldBox className="w-[193px] shrink-0" error={errors[`${p}Date`]}>
                <DayField
                  label={field.label}
                  trip={trip}
                  value={byDates ? values[`${p}Date`] ?? "" : values[`${p}Day`] ?? ""}
                  min={p === "end" ? values.startDate : undefined}
                  invalid={!!errors[`${p}Date`]}
                  onChange={(v) => {
                    set(byDates ? `${p}Date` : `${p}Day`, v);
                    // Partida preenchida → sugere a mesma data para a chegada
                    if (p === "start" && category === "TRANSPORT" && !values[byDates ? "endDate" : "endDay"]) set(byDates ? "endDate" : "endDay", v);
                  }}
                />
              </FieldBox>
              <FieldBox className="min-w-0 flex-1" error={errors[`${p}Time`]}>
                <TimeField label={field.timeLabel} value={values[`${p}Time`] ?? ""} invalid={!!errors[`${p}Time`]} onChange={(v) => set(`${p}Time`, v)} />
              </FieldBox>
            </div>
          );
        })}
      </div>

      {spec.help && (
        // Figma: chip cinza #E5E5E5 · 32px · raio 8 · "Buscar" em azul
        <Link
          href={spec.help.href}
          className="mt-[26px] flex h-8 items-center gap-[6px] self-start rounded-[8px] bg-tripper-light-500 px-3 text-p16 leading-[1.2] font-medium"
        >
          <span className="text-muted-foreground">{spec.help.text}</span>
          <span className="text-primary">Buscar</span>
        </Link>
      )}

      {/* Excluir item: arrastando o item para a esquerda no roteiro (itinerary.tsx) */}
      <div className={cn("flex items-center justify-end", spec.help ? "mt-[49px]" : "mt-[57px]")}>
        <button
          type="submit"
          disabled={save.isPending}
          className="mr-4 text-h3 leading-[1.2] font-medium text-primary disabled:opacity-50"
        >
          {save.isPending ? "Salvando..." : item ? "Salvar" : "Adicionar"}
        </button>
      </div>
    </form>
  );
}

/** Índice do dia (para contar diárias), a partir da data ou do número do dia. */
function dayIndex(values: Values, prefix: "start" | "end", byDates: boolean, trip: TripDTO) {
  if (byDates) {
    const v = values[`${prefix}Date`];
    return v && trip.startDate ? Math.round((Date.parse(v) - Date.parse(trip.startDate.slice(0, 10))) / 86_400_000) : 0;
  }
  return Number(values[`${prefix}Day`] || 0);
}

/** "Transportes": campo "Tipos de Transporte" que abre a lista de tipos. */
function TransportPicker({ onPick }: { onPick: (mode: TransportMode) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("flex flex-col px-6 pt-[31px]", open ? "pb-[69px]" : "pb-[112px]")}>
      <DrawerTitle className="text-h5 leading-[1.2] font-medium text-foreground">Transportes</DrawerTitle>
      <DrawerDescription className="sr-only">Escolha o tipo de transporte</DrawerDescription>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        className={cn("mt-8 flex h-6 w-full items-center justify-between border-b text-left", open ? "border-foreground" : "border-input")}
      >
        <span className="text-p16 leading-[1.2] text-muted-foreground">Tipos de Transporte</span>
        <img src="/icons/itens/down.svg" alt="" width={22} height={22} className={cn("transition-transform duration-250 ease-figma-out", open && "rotate-180")} />
      </button>
      {open && (
        // Figma "Container": branco, sombra, cantos inferiores de 4px; itens a cada 47px;
        // 21px antes do primeiro ícone e 22px depois do último. Abre com "Smart animate" de 250ms
        <ul
          role="listbox"
          aria-label="Tipos de Transporte"
          className="flex animate-in flex-col duration-250 ease-figma-out fade-in rounded-b-[4px] bg-white pt-[21px] pb-[22px] shadow-[0px_1px_4px_1px_rgba(0,0,0,0.25)]"
        >
          {TRANSPORT_MODES.map(({ mode, label, icon }, i) => (
            <li key={mode}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => onPick(mode)}
                className={cn("flex w-full items-start gap-3 px-3 text-left", i === TRANSPORT_MODES.length - 1 ? "h-6" : "h-[47px]")}
              >
                <img src={icon} alt="" width={24} height={24} />
                <span className="pt-[3px] text-p16 leading-[1.2] text-muted-foreground">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FieldBox({ children, error, className }: { children: React.ReactNode; error?: string; className?: string }) {
  return (
    <div className={className}>
      {children}
      {error && <p className="mt-1 text-small text-destructive">{error}</p>}
    </div>
  );
}

const underline =
  "relative flex h-6 w-full items-end gap-2 border-b border-input pb-1 focus-within:border-primary has-[[aria-invalid=true]]:border-destructive";

/** Data (viagem com datas) ou "Dia N" (viagem só com quantidade de dias), com ícone de calendário. */
function DayField({
  label,
  trip,
  value,
  min,
  invalid,
  onChange,
}: {
  label: string;
  trip: TripDTO;
  value: string;
  min?: string;
  invalid?: boolean;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const byDates = !!trip.startDate;
  const display = !value
    ? label
    : byDates
      ? new Date(`${value}T12:00:00Z`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "UTC" })
      : `Dia ${value}`;

  return (
    <label className={underline}>
      <img src="/icons/calendar.svg" alt="" width={22} height={22} className="mb-[-2px]" />
      <span className={cn("truncate text-p16 leading-[1.2]", value ? "text-foreground" : "text-muted-foreground")}>{display}</span>
      {byDates ? (
        <input
          ref={ref}
          type="date"
          aria-label={label.replace("*", "")}
          aria-invalid={invalid}
          value={value}
          min={(min || trip.startDate?.slice(0, 10)) ?? undefined}
          max={trip.endDate?.slice(0, 10) ?? undefined}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => ref.current?.showPicker?.()}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      ) : (
        <select
          aria-label={label.replace("*", "")}
          aria-invalid={invalid}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          <option value="">{label.replace("*", "")}</option>
          {Array.from({ length: trip.daysCount }, (_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              Dia {i + 1}
            </option>
          ))}
        </select>
      )}
    </label>
  );
}

function TimeField({ label, value, invalid, onChange }: { label: string; value: string; invalid?: boolean; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <label className={underline}>
      <span className={cn("text-p16 leading-[1.2]", value ? "text-foreground" : "text-muted-foreground")}>{value || label}</span>
      <input
        ref={ref}
        type="time"
        aria-label={label.replace("*", "")}
        aria-invalid={invalid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={() => ref.current?.showPicker?.()}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}
