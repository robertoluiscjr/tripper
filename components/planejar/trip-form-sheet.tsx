"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { createTripSchema } from "@/lib/validations";
import { ApiError, type TripFormInput } from "@/hooks/use-trips";
import type { TripDTO } from "@/lib/trips";

/* eslint-disable @next/next/no-img-element */

/**
 * Bottom sheet "Nova Viagem" (Figma 3463:2970 · 2139:1794): nome da viagem e
 * duração por Datas (inicial/final) ou por quantidade de Dias (– N +).
 * Reutilizado para editar a viagem (ícone de edição da Tela da Viagem).
 */
export function TripFormSheet({
  open,
  onOpenChange,
  title = "Nova Viagem",
  submitLabel = "Criar",
  trip,
  onSubmit,
  pending,
  footer,
}: {
  open: boolean;
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
  pending,
  footer,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  trip?: TripDTO;
  pending?: boolean;
  footer?: React.ReactNode;
  onSubmit: (input: TripFormInput) => void;
}) {
  const [name, setName] = useState(trip?.name ?? "");
  const [mode, setMode] = useState<"dates" | "days">(trip && !trip.startDate ? "days" : "dates");
  const [startDate, setStartDate] = useState(toDateInput(trip?.startDate));
  const [endDate, setEndDate] = useState(toDateInput(trip?.endDate));
  const [days, setDays] = useState(trip?.daysCount ?? 1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const input: TripFormInput = {
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
      <DrawerDescription className="sr-only">Defina o nome e a duração da viagem</DrawerDescription>

      {/* Nome da Viagem */}
      <UnderlineInput
        className="mt-8"
        value={name}
        onChange={setName}
        placeholder="Nome da Viagem"
        aria-label="Nome da Viagem"
        error={errors.name}
        autoFocus={!trip}
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

      <Button type="submit" size="cta" disabled={pending} className="mx-4 mt-[47px] w-auto">
        {pending ? "Salvando..." : submitLabel}
      </Button>
      {footer}
    </form>
  );
}

function UnderlineInput({
  value,
  onChange,
  error,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "onChange" | "value"> & {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className={className}>
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={cn(
          "h-6 w-full border-b border-input bg-transparent pb-1 text-p16 leading-[1.2] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary aria-invalid:border-destructive",
        )}
      />
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
          "relative flex h-6 w-full items-end gap-2 border-b border-input pb-[2px] focus-within:border-primary",
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
