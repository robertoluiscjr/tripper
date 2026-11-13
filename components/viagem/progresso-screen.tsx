"use client";

import { useState } from "react";
import Link from "next/link";
import type { ItemCategory } from "@prisma/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTrip, useUpdateProgressPlan } from "@/hooks/use-trips";
import { usePendingDeletes, useTripItems } from "@/hooks/use-trip-items";
import { CATEGORY_MENU, type TripItemDTO } from "@/lib/trip-items";
import { PLAN_MAX, computeProgress, suggestedPlan, type ProgressPlan } from "@/lib/progress";
import { daysLabel, type TripDTO } from "@/lib/trips";

/* eslint-disable @next/next/no-img-element */

/** "+ Adicionar …" de cada categoria (singular) */
const ADD_LABEL: Record<ItemCategory, string> = {
  TRANSPORT: "transporte",
  ACCOMMODATION: "acomodação",
  TOUR: "passeio",
  FOOD: "lugar para comer",
  CAR_RENTAL: "aluguel de carro",
  CUSTOM: "atividade",
};

/** "Ainda faltam: 1 transporte e 2 passeios" */
const PLURAL: Record<ItemCategory, string> = {
  TRANSPORT: "transportes",
  ACCOMMODATION: "acomodações",
  TOUR: "passeios",
  FOOD: "lugares para comer",
  CAR_RENTAL: "aluguéis de carro",
  CUSTOM: "atividades",
};
const joinPt = (parts: string[]) => (parts.length < 2 ? parts.join("") : `${parts.slice(0, -1).join(", ")} e ${parts.at(-1)}`);

/**
 * Ver Progresso — Figma "Progresso da viagem 2 (A + C)" (4863:6102): topo do frame original
 * (título, destino • dias, aviso de reservas, próximo passo + CTA de 313px), barra contínua com
 * "5 de 8 itens adicionados" e a % logo acima (opção C) +
 * opções A + C escolhidas na conversa de design para o conteúdo (mesmo card de Estimar Gastos). escolhidas na conversa de design; mesmo visual de Estimar Gastos).
 * - Topo: barra geral "Planejamento" com % e "5 de 8 itens adicionados".
 * - Um card por categoria: interruptor (vai ter / não vai ter) e quantos itens são previstos (– N +).
 * - Tocar no card ligado mostra as "vagas": itens já no roteiro (✓) e as vazias com "+ Adicionar",
 *   que abrem o formulário daquela categoria na Tela da Viagem.
 */
export function ProgressoScreen({ initialTrip, initialItems }: { initialTrip: TripDTO; initialItems: TripItemDTO[] }) {
  const { data: trip = initialTrip } = useTrip(initialTrip.id, initialTrip);
  const { data: allItems = initialItems } = useTripItems(initialTrip.id, initialItems);
  const pendingDeletes = usePendingDeletes();
  const items = allItems.filter((i) => !pendingDeletes.has(i.id));
  const update = useUpdateProgressPlan(trip.id);

  // Ainda não configurado: começa pelo que já existe no roteiro
  const configured = trip.progressPlan !== null;
  const plan: ProgressPlan = trip.progressPlan ?? suggestedPlan(items);
  const progress = computeProgress(plan, items);
  const [open, setOpen] = useState<ItemCategory | null>(null);

  function save(next: ProgressPlan) {
    update.save(next, { onError: () => toast.error("Não foi possível salvar o progresso.") });
  }
  function toggle(category: ItemCategory, on: boolean) {
    const next = { ...plan };
    if (on) next[category] = Math.max(1, items.filter((i) => i.category === category).length);
    else delete next[category];
    if (!on && open === category) setOpen(null);
    save(next);
  }
  function setCount(category: ItemCategory, n: number) {
    save({ ...plan, [category]: Math.min(PLAN_MAX, Math.max(1, n)) });
  }

  const complete = progress.planned > 0 && progress.done === progress.planned;
  // Próximo passo: a primeira categoria (na ordem do menu) que ainda tem vaga
  const missing = CATEGORY_MENU.filter(({ category }) => {
    const c = progress.byCategory[category];
    return c && c.done < c.planned;
  }).map(({ category }) => ({ category, n: progress.byCategory[category]!.planned - progress.byCategory[category]!.done }));
  const next = missing[0];

  return (
    <main className="flex flex-1 flex-col px-6 pt-16 pb-16">
      <Link href={`/app/viagens/${trip.id}`} aria-label="Voltar para a viagem" className="self-start">
        <img src="/icons/back.svg" alt="" width={24} height={24} />
      </Link>

      <h1 className="mt-6 text-h1 leading-[normal] font-semibold tracking-[-0.05em] text-foreground">Progresso da viagem</h1>
      <p className="text-p16 leading-[1.2] font-medium text-foreground">
        {trip.name} • {daysLabel(trip.daysCount)}
      </p>

      {/* Resumo (opção C): "5 de 8 itens adicionados" e a % (grande) logo acima de uma barra contínua */}
      <section aria-label="Progresso do planejamento" className="mt-4">
        <div className="flex items-baseline justify-between gap-4 font-medium">
          <span className="min-w-0 text-p16 leading-5 text-foreground">
            {progress.planned === 0
              ? "Nenhuma categoria ligada"
              : `${progress.done} de ${progress.planned} ${progress.planned === 1 ? "item adicionado" : "itens adicionados"}`}
          </span>
          {/* % grande: 32px Medium, -3%; leading-none para a linha não abrir espaço vazio acima do texto */}
          <span className={cn("shrink-0 text-[32px] leading-none tracking-[-0.03em]", complete ? "text-success" : "text-primary")}>
            {progress.percent}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Planejamento da viagem"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
          className="mt-2 h-2 overflow-hidden rounded-[4px] bg-tripper-blue-100"
        >
          <div
            className={cn("h-full rounded-[4px] transition-[width] duration-300 ease-figma-out", complete ? "bg-success" : "bg-primary")}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className="mt-2 text-p14 leading-[18px] text-muted-foreground">Itens adicionados não indicam reservas confirmadas.</p>
      </section>

      <h2 className="mt-6 text-h3 leading-[1.2] font-medium tracking-[-0.03em] text-foreground">O que a viagem vai ter</h2>
      <p className="mt-2 text-p16 leading-[18px] text-muted-foreground">
        {configured || progress.planned === 0
          ? "Ligue as categorias e diga quantos itens você espera em cada uma."
          : "Sugestão inicial: ida e volta, hospedagem e o que já está no roteiro. Ajuste à vontade."}
      </p>

      <ul className="mt-6 flex flex-col gap-6">
        {CATEGORY_MENU.map(({ category, label }) => {
          const on = plan[category] !== undefined;
          const stats = progress.byCategory[category];
          const list = items.filter((i) => i.category === category);
          const slug = category.toLowerCase().replace(/_/g, "-");
          const expanded = on && open === category;
          const full = !!stats && stats.added >= stats.planned;
          return (
            <li key={category} className="overflow-hidden rounded-[12px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)]">
              {/* Topo: azul quando a viagem vai ter a categoria; cinza quando não */}
              <div
                className={cn(
                  "flex h-10 items-center pr-3 pl-3 text-p14 leading-[1.2] transition-colors duration-250 ease-figma-out",
                  on ? "bg-primary text-white" : "bg-tripper-light-300 text-muted-foreground",
                )}
              >
                <img src={on ? `/icons/itens/white/cat-${slug}.svg` : `/icons/itens/${slug}.svg`} alt="" width={24} height={24} />
                <span className="ml-2 flex-1">{label}</span>
                <Toggle checked={on} onChange={(v) => toggle(category, v)} label={`A viagem vai ter ${label}`} />
              </div>

              {on && stats && (
                <div className="bg-white text-p14 leading-[1.2]">
                  <div className="flex items-center gap-3 pt-3 pr-4 pb-[11px] pl-3">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`vagas-${slug}`}
                      onClick={() => setOpen(expanded ? null : category)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <img
                        src="/icons/itens/down.svg"
                        alt=""
                        width={16}
                        height={16}
                        className={cn("shrink-0 transition-transform duration-250 ease-figma-out", expanded && "rotate-180")}
                      />
                      <span className={cn("font-medium", full ? "text-success" : "text-foreground")}>
                        {Math.min(stats.added, stats.planned)} de {stats.planned}
                      </span>
                      <span className="truncate text-muted-foreground">{full ? "completo" : "adicionados"}</span>
                    </button>
                    {/* Itens previstos: – N + (mesmo stepper da Nova Viagem) */}
                    <div className="flex items-center" role="group" aria-label={`Itens previstos em ${label}`}>
                      <button
                        type="button"
                        aria-label={`Prever menos itens em ${label}`}
                        disabled={stats.planned <= 1}
                        onClick={() => setCount(category, stats.planned - 1)}
                        className="disabled:opacity-40"
                      >
                        <img src="/icons/menos.svg" alt="" width={24} height={24} />
                      </button>
                      <span aria-live="polite" className="w-8 text-center text-p16 text-foreground">
                        {stats.planned}
                      </span>
                      <button
                        type="button"
                        aria-label={`Prever mais itens em ${label}`}
                        disabled={stats.planned >= PLAN_MAX}
                        onClick={() => setCount(category, stats.planned + 1)}
                        className="disabled:opacity-40"
                      >
                        <img src="/icons/mais.svg" alt="" width={24} height={24} />
                      </button>
                    </div>
                  </div>

                  {/* Vagas: itens já no roteiro + as que faltam */}
                  {expanded && (
                    <ul id={`vagas-${slug}`} className="flex animate-in flex-col gap-3 border-t border-tripper-light-500 px-3 pt-3 pb-4 duration-250 ease-figma-out fade-in">
                      {list.map((item) => (
                        <li key={item.id} className="flex items-center gap-2 text-foreground">
                          <img src="/icons/check-circle.svg" alt="" width={20} height={20} />
                          <span className="truncate">{item.title}</span>
                        </li>
                      ))}
                      {Array.from({ length: Math.max(0, stats.planned - stats.added) }, (_, i) => (
                        <li key={`vaga-${i}`}>
                          <Link href={`/app/viagens/${trip.id}?novo=${category}`} className="flex items-center gap-2 font-medium text-primary">
                            <img src="/icons/add-circle.svg" alt="" width={20} height={20} />
                            Adicionar {ADD_LABEL[category]}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Próximo passo (Figma: texto + CTA "Planejar Dia 3") */}
      <p className="mt-6 text-p16 leading-5 text-muted-foreground">
        {progress.planned === 0
          ? "Ligue as categorias acima para acompanhar o progresso do planejamento."
          : complete
            ? "Tudo planejado! Agora é só aproveitar a viagem ✈️"
            : `Ainda ${missing.reduce((s, m) => s + m.n, 0) === 1 ? "falta" : "faltam"} ${joinPt(missing.map(({ category, n }) => `${n} ${n === 1 ? ADD_LABEL[category] : PLURAL[category]}`))}.`}
      </p>
      {next && (
        <Button size="cta" asChild className="mt-6">
          <Link href={`/app/viagens/${trip.id}?novo=${next.category}`}>Adicionar {ADD_LABEL[next.category]}</Link>
        </Button>
      )}
    </main>
  );
}

/** Interruptor (switch) — 40 × 24, bolinha de 18px. */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-10 shrink-0 rounded-full transition-colors duration-250 ease-figma-out outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        checked ? "bg-white" : "bg-tripper-dark-300",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] left-[3px] size-[18px] rounded-full transition-transform duration-250 ease-figma-out",
          checked ? "translate-x-4 bg-primary" : "bg-white",
        )}
      />
    </button>
  );
}
