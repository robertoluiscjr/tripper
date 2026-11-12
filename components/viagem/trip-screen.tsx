"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ItemCategory } from "@prisma/client";
import { useDeleteTrip, useTrip, useUpdateTrip } from "@/hooks/use-trips";
import { useTripItems } from "@/hooks/use-trip-items";
import type { TripItemDTO } from "@/lib/trip-items";
import { daysLabel, type TripDTO } from "@/lib/trips";
import { TripFormSheet } from "@/components/planejar/trip-form-sheet";
import { TripMap } from "./trip-map";
import { Itinerary } from "./itinerary";
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
  const [dayFilter, setDayFilter] = useState<number | "all">("all");
  const { data: items = initialItems } = useTripItems(initialTrip.id, initialItems);
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
      <Itinerary days={visibleDays} items={items} onOpenItem={(item) => setItemSheet({ category: item.category, item })} />

      {/* + Novo item (Figma "Button with icon"); aberto, vira "×" escuro acima do fundo do menu */}
      <div className={cn("pointer-events-none sticky bottom-[104px] mt-auto flex justify-end px-6 pt-8", menuOpen ? "z-[36]" : "z-30")}>
        <Button
          size="fab"
          aria-label={menuOpen ? "Fechar menu de itens" : "Adicionar item ao roteiro"}
          aria-expanded={menuOpen}
          className={cn("pointer-events-auto", menuOpen && "bg-tripper-dark-700 hover:bg-tripper-dark-700 active:bg-tripper-dark-700")}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <img src={menuOpen ? "/icons/itens/close-white.svg" : "/icons/add-fab.svg"} alt="" width={28} height={28} />
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
