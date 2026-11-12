"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { itemBadgeIcon, itemCardIcon, itemLines, itemPhoto, itineraryForDay, type ItineraryEntry, type TripItemDTO } from "@/lib/trip-items";

/* eslint-disable @next/next/no-img-element */

/**
 * Roteiro dia a dia — Figma "Tela da Viagem 2" (2098:2018) e "3" (2109:1868).
 * Cada item: círculo escuro de 40px com o ícone, foto de 64px e 3 linhas de texto (14px Medium).
 * A "Linha do Tempo" (5px, #454545) liga um item ao próximo, inclusive atravessando dias vazios.
 * Item recém-adicionado aparece com dissolve de 250ms (Smart animate do Figma ao salvar).
 */
export function Itinerary({
  days,
  items,
  cityPhoto,
  onOpenItem,
}: {
  days: number[];
  items: TripItemDTO[];
  /** Foto do destino (capa da viagem): usada na hospedagem sem foto própria */
  cityPhoto?: string | null;
  onOpenItem: (item: TripItemDTO) => void;
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
  // Dias (de toda a viagem) que têm itens — para saber se a linha continua antes/depois de cada dia
  const allDays = Array.from(new Set(items.flatMap((i) => [i.dayNumber, ...(i.endDayNumber ? [i.endDayNumber] : [])])));
  const hasBefore = (d: number) => allDays.some((x) => x < d);
  const hasAfter = (d: number) => allDays.some((x) => x > d);

  return (
    <ol className="mt-[30px] flex flex-col gap-6 px-6">
      {days.map((d, i) => {
        const entries = byDay.get(d) ?? [];
        const last = i === days.length - 1;
        return (
          <li key={d} className={cn("relative flex flex-col", !last && "border-b border-tripper-divider pb-6")}>
            <h2 className="text-h3 leading-[1.2] font-medium text-foreground">Dia {d}</h2>
            {entries.length === 0 ? (
              <>
                <p className="mt-2 text-p16 leading-[1.2] text-muted-foreground">Adicione itens neste dia</p>
                {hasBefore(d) && hasAfter(d) && !last && <Line className="-bottom-6 h-10" />}
              </>
            ) : (
              <ul className="mt-4 flex flex-col gap-8">
                {entries.map((entry, j) => (
                  <li
                    key={`${entry.item.id}-${entry.kind}`}
                    className={cn("relative", fresh.has(entry.item.id) && "animate-in duration-250 ease-figma-out fade-in")}
                    onAnimationEnd={(e) => e.target === e.currentTarget && settle(entry.item.id)}
                  >
                    {j === 0 && hasBefore(d) && <Line className="-top-3 h-[25px]" />}
                    {j < entries.length - 1 ? (
                      <Line className="top-[50px] h-[60px]" />
                    ) : (
                      hasAfter(d) && !last && <Line className="top-[52px] h-[61px]" />
                    )}
                    <ItemRow entry={entry} cityPhoto={cityPhoto} onOpen={() => onOpenItem(entry.item)} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Line({ className }: { className?: string }) {
  return <span aria-hidden className={cn("absolute left-[25.5px] w-[5px] bg-tripper-dark-700", className)} />;
}

/** "Item do roteiro" (Figma 2109:1874). */
function ItemRow({ entry, cityPhoto, onOpen }: { entry: ItineraryEntry; cityPhoto?: string | null; onOpen: () => void }) {
  const { item } = entry;
  const lines = itemLines(entry);
  const photo = itemPhoto(item, cityPhoto);

  return (
    <button type="button" onClick={onOpen} aria-label={`Editar ${lines.title}`} className="relative flex h-16 w-full items-center pl-2 text-left">
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
