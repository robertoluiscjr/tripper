"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { createTripSchema, type DestinationPlace } from "@/lib/validations";
import { ApiError, type TripFormInput } from "@/hooks/use-trips";
import type { TripDTO } from "@/lib/trips";
import { DestinationField } from "./destination-field";

/* eslint-disable @next/next/no-img-element */

/**
 * Bottom sheet "Nova Viagem" (Figma "Nova Viagem 3–6", 5054:6262…): destino (com sugestões de
 * lugares reais), nome da viagem (opcional; vazio = nome do destino) e duração por Datas
 * (inicial/final) ou por quantidade de Dias (– N +). A foto de capa e o mapa vêm do destino.
 * Reutilizado para editar a viagem (ícone de edição da Tela da Viagem).
 * initialPlace: destino já preenchido (ex.: "Adicionar à viagem" de um passeio do Rio).
 */
export function TripFormSheet({
  open,
  onOpenChange,
  title = "Nova Viagem",
  submitLabel = "Criar",
  trip,
  initialPlace,
  onSubmit,
  pending,
  footer,
}: {
  open: boolean;
  initialPlace?: DestinationPlace;
  onOpenChange: (open: boolean) => void;
  title?: string;
  submitLabel?: string;
  trip?: TripDTO;
  onSubmit: (input: TripFormInput) => Promise<unknown>;
  pending?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        {/* key: reinicia o formulário a cada abertura */}
        {open && (
          <TripForm
            key={trip?.id ?? "new"}
            title={title}
            submitLabel={submitLabel}
            trip={trip}
            initialPlace={initialPlace}
            pending={pending}
            footer={footer}
            onSubmit={async (input) => {
              try {
                await onSubmit(input);
                onOpenChange(false);
              } catch (err) {
                toast.error(err instanceof ApiError ? err.message : "Não foi possível salvar a viagem.");
              }
            }}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

const toDateInput = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : "");

function TripForm({
  title,
  submitLabel,
  trip,
  initialPlace,
  pending,
  footer,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  trip?: TripDTO;
  initialPlace?: DestinationPlace;
  pending?: boolean;
  footer?: React.ReactNode;
  onSubmit: (input: TripFormInput) => void;
}) {
  const [destination, setDestination] = useState(initialPlace?.label ?? trip?.destination ?? trip?.name ?? "");
  const [place, setPlace] = useState<DestinationPlace | null>(initialPlace ?? null);
  // Cursor no Destino ao abrir só com mouse/teclado físico. No celular, cursor = teclado aberto
  // cobrindo metade da folha: a pessoa vê a folha inteira primeiro e toca no campo quando quiser.
  const [finePointer] = useState(() => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches);
  const [name, setName] = useState(trip?.name ?? "");
  const [mode, setMode] = useState<"dates" | "days">(trip && !trip.startDate ? "days" : "dates");
  const [startDate, setStartDate] = useState(toDateInput(trip?.startDate));
  const [endDate, setEndDate] = useState(toDateInput(trip?.endDate));
  const [days, setDays] = useState(trip?.daysCount ?? 1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const input: TripFormInput = {
      destination,
      ...(place ? { place } : {}),
      name,
      durationMode: mode,
      ...(mode === "dates" ? { startDate, endDate } : { daysCount: days }),
    };
    const parsed = createTripSchema.safeParse(input);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit(input);
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col px-6 pt-[31px] pb-8">
      <DrawerTitle className="text-h5 leading-[1.2] font-medium text-foreground">{title}</DrawerTitle>
      <DrawerDescription className="sr-only">Defina o destino, o nome e a duração da viagem</DrawerDescription>

      {/* Destino (com sugestões de lugares reais) */}
      <DestinationField
        className="mt-8"
        value={destination}
        place={place}
        onChange={setDestination}
        onSelect={setPlace}
        error={errors.destination}
        autoFocus={!trip && !initialPlace && finePointer}
      />

      {/* Nome da viagem (opcional) — ícone "sell" (etiqueta de mala), 20px no espaço de 22 */}
      <IconInput
        className="mt-6"
        icon="/icons/sell.svg"
        value={name}
        onChange={setName}
        placeholder="Nome da viagem (opcional)"
        aria-label="Nome da viagem (opcional)"
        maxLength={80}
        error={errors.name}
      />

      <p className="mt-7 text-p16 leading-[1.2] text-muted-foreground">Duração:</p>

      {/* Datas */}
      <Radio className="mt-[17px]" checked={mode === "dates"} onSelect={() => setMode("dates")} label="Datas" />
      <div className={cn("mt-[18px] flex flex-col gap-6 pl-[39px]", mode !== "dates" && "pointer-events-none opacity-50")}>
        <DateField label="Data Inicial" value={startDate} onChange={setStartDate} disabled={mode !== "dates"} error={errors.startDate} />
        <DateField label="Data Final" value={endDate} min={startDate} onChange={setEndDate} disabled={mode !== "dates"} error={errors.endDate} />
      </div>

      {/* Dias */}
      <Radio className="mt-[23px]" checked={mode === "days"} onSelect={() => setMode("days")} label="Dias" />
      <div className={cn("mt-3 flex items-center pl-[37px]", mode !== "days" && "pointer-events-none opacity-50")}>
        <button type="button" aria-label="Diminuir dias" disabled={mode !== "days" || days <= 1} onClick={() => setDays((d) => Math.max(1, d - 1))} className="disabled:opacity-40">
          <img src="/icons/menos.svg" alt="" width={24} height={24} />
        </button>
        <span aria-live="polite" className="w-[42px] text-center text-p16 leading-[1.2] text-muted-foreground">{days}</span>
        <button type="button" aria-label="Aumentar dias" disabled={mode !== "days" || days >= 90} onClick={() => setDays((d) => Math.min(90, d + 1))} className="disabled:opacity-40">
          <img src="/icons/mais.svg" alt="" width={24} height={24} />
        </button>
      </div>
      {errors.daysCount && <FieldError>{errors.daysCount}</FieldError>}

      <Button type="submit" size="cta" disabled={pending} className="mt-[47px]">
        {pending ? "Salvando..." : submitLabel}
      </Button>
      {footer}
    </form>
  );
}

/** Campo com ícone à esquerda (Figma "Text Field with icon"): ícone 22 + texto 16, linha embaixo. */
function IconInput({
  icon,
  value,
  onChange,
  error,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "onChange" | "value"> & {
  icon: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className={className}>
      <label className={cn("flex h-6 items-end gap-2 border-b border-input pb-[2px] focus-within:line-focus", error && "border-destructive")}>
        <img src={icon} alt="" width={22} height={22} className="shrink-0" />
        <input
          {...props}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className="h-[19px] min-w-0 flex-1 bg-transparent text-p16 leading-[1.2] text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

/** Campo de data no estilo "Text Field with icon": mostra o rótulo até ser preenchido. */
function DateField({
  label,
  value,
  onChange,
  min,
  disabled,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  disabled?: boolean;
  error?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const display = value
    ? new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    : label;

  return (
    <div>
      <label
        className={cn(
          "relative flex h-6 w-full items-end gap-2 border-b border-input pb-[2px] focus-within:line-focus",
          error && "border-destructive",
        )}
      >
        <img src="/icons/calendar.svg" alt="" width={22} height={22} />
        <span className={cn("text-p16 leading-[1.2]", value ? "text-foreground" : "text-muted-foreground")}>{display}</span>
        <input
          ref={ref}
          type="date"
          aria-label={label}
          value={value}
          min={min || undefined}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => ref.current?.showPicker?.()}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

function Radio({
  checked,
  onSelect,
  label,
  className,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button type="button" role="radio" aria-checked={checked} onClick={onSelect} className={cn("flex items-center gap-4", className)}>
      <img src={checked ? "/icons/radio-filled.svg" : "/icons/radio.svg"} alt="" width={22} height={22} />
      <span className="text-p16 leading-[1.2] text-muted-foreground">{label}</span>
    </button>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-small text-destructive">{children}</p>;
}
