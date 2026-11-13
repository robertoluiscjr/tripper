import type { ItemCategory } from "@prisma/client";
import type { TripItemDTO } from "@/lib/trip-items";

/**
 * "Ver Progresso": a pessoa liga as categorias que a viagem vai ter e diz quantos itens espera
 * em cada uma. O app conta sozinho os itens já adicionados ao roteiro.
 * Progresso = itens adicionados ÷ itens previstos (só categorias ligadas; cada categoria conta
 * no máximo o que foi previsto, para item a mais não esconder o que falta nas outras).
 */
export type ProgressPlan = Partial<Record<ItemCategory, number>>;

export const PLAN_MAX = 30; // itens previstos por categoria

/** Lê o JSON salvo (ignora chaves/valores inválidos). */
export function parsePlan(value: unknown): ProgressPlan | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const plan: ProgressPlan = {};
  for (const [key, n] of Object.entries(value as Record<string, unknown>)) {
    if (CATEGORIES.includes(key as ItemCategory) && typeof n === "number" && n >= 1) {
      plan[key as ItemCategory] = Math.min(PLAN_MAX, Math.round(n));
    }
  }
  return plan;
}

const CATEGORIES: ItemCategory[] = ["TRANSPORT", "ACCOMMODATION", "TOUR", "FOOD", "CAR_RENTAL", "CUSTOM"];

/**
 * Ainda não configurado: toda viagem costuma ter ida e volta e onde ficar (Transportes 2,
 * Acomodações 1), mais as categorias que já têm itens no roteiro, na quantidade atual.
 */
export function suggestedPlan(items: Pick<TripItemDTO, "category">[]): ProgressPlan {
  const plan: ProgressPlan = { TRANSPORT: 2, ACCOMMODATION: 1 };
  const counts: ProgressPlan = {};
  for (const item of items) counts[item.category] = (counts[item.category] ?? 0) + 1;
  for (const [category, n] of Object.entries(counts) as [ItemCategory, number][]) {
    plan[category] = Math.min(PLAN_MAX, Math.max(plan[category] ?? 0, n));
  }
  return plan;
}

export type CategoryProgress = { planned: number; added: number; done: number };

export function computeProgress(plan: ProgressPlan, items: Pick<TripItemDTO, "category">[]) {
  const byCategory: Partial<Record<ItemCategory, CategoryProgress>> = {};
  let planned = 0;
  let done = 0;
  for (const [category, n] of Object.entries(plan) as [ItemCategory, number][]) {
    const added = items.filter((i) => i.category === category).length;
    const d = Math.min(added, n);
    byCategory[category] = { planned: n, added, done: d };
    planned += n;
    done += d;
  }
  const percent = planned ? Math.round((done / planned) * 100) : 0;
  return { planned, done, percent, byCategory };
}
