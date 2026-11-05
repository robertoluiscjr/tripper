"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDeleteTrip, useTrip, useUpdateTrip } from "@/hooks/use-trips";
import { daysLabel, type TripDTO } from "@/lib/trips";
import { TripFormSheet } from "@/components/planejar/trip-form-sheet";
import { TripMap } from "./trip-map";

/* eslint-disable @next/next/no-img-element */

/**
 * Tela da Viagem — Figma 180:687: título + duração, mapa, Estimar Gastos /
 * Ver Progresso, filtro de dias e roteiro dia a dia ("Adicione itens neste
 * dia" em todos os dias — feedback do 1º teste de usabilidade).
 */
export function TripScreen({ initialTrip }: { initialTrip: TripDTO }) {
  const router = useRouter();
  const { data: trip = initialTrip } = useTrip(initialTrip.id, initialTrip);
  const updateTrip = useUpdateTrip(trip.id);
  const deleteTrip = useDeleteTrip(trip.id);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dayFilter, setDayFilter] = useState<number | "all">("all");

  const days = Array.from({ length: trip.daysCount }, (_, i) => i + 1);
  const visibleDays = dayFilter === "all" ? days : days.filter((d) => d === dayFilter);
  const comingSoon = (feature: string) => toast(`${feature} chega na próxima etapa do Tripper ✈️`);

  return (
    <main className="relative flex flex-1 flex-col pb-8">
      {/* Topo: voltar · editar */}
      <div className="flex items-center justify-between px-6 pt-16">
        <Link href="/app/planejar" aria-label="Voltar para Planejar">
          <img src="/icons/back.svg" alt="" width={24} height={24} />
        </Link>
        <button type="button" aria-label="Editar viagem" onClick={() => { setConfirmDelete(false); setEditOpen(true); }}>
          <img src="/icons/edit.svg" alt="" width={24} height={24} />
        </button>
      </div>

      {/* Title + Duração */}
      <div className="mt-6 px-6">
        <h1 className="text-h1 leading-[normal] font-semibold tracking-[-0.05em] text-foreground">{trip.name}</h1>
        <p className="text-p16 leading-[1.2] font-medium text-foreground">{daysLabel(trip.daysCount)}</p>
      </div>

      <div className="mt-2">
        <TripMap latitude={trip.latitude} longitude={trip.longitude} />
      </div>

      {/* Estimar Gastos | Ver Progresso */}
      <div className="relative mt-2 grid h-8 grid-cols-2">
        <button type="button" onClick={() => comingSoon("Estimar Gastos")} className="flex items-center justify-center gap-1">
          <img src="/icons/calculate.svg" alt="" width={24} height={24} />
          <span className="text-p16 leading-[1.2] font-medium text-foreground">Estimar Gastos</span>
        </button>
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
      <ol className="mt-[30px] flex flex-col gap-6 px-6">
        {visibleDays.map((d, i) => (
          <li key={d} className={cn("flex flex-col", i < visibleDays.length - 1 && "border-b border-tripper-divider pb-6")}>
            <h2 className="text-h3 leading-[1.2] font-medium text-foreground">Dia {d}</h2>
            <p className="mt-2 text-p16 leading-[1.2] text-muted-foreground">Adicione itens neste dia</p>
          </li>
        ))}
      </ol>

      {/* + Novo item (Figma "Button with icon") */}
      <div className="pointer-events-none sticky bottom-[104px] z-30 mt-auto flex justify-end px-6 pt-8">
        <Button size="fab" aria-label="Adicionar item ao roteiro" className="pointer-events-auto" onClick={() => comingSoon("Adicionar itens")}>
          <img src="/icons/add-fab.svg" alt="" width={28} height={28} />
        </Button>
      </div>

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
        footer={
          <button
            type="button"
            disabled={deleteTrip.isPending}
            onClick={async () => {
              if (!confirmDelete) return setConfirmDelete(true);
              await deleteTrip.mutateAsync();
              toast.success("Viagem excluída");
              router.replace("/app/planejar");
            }}
            className="mt-5 self-center text-p14 font-medium text-destructive"
          >
            {confirmDelete ? "Toque de novo para confirmar a exclusão" : "Excluir viagem"}
          </button>
        }
      />
    </main>
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
