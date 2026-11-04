import type { Plan } from "@prisma/client";

/**
 * ⚠️ VALORES PROVISÓRIOS — o modelo de monetização do Tripper ainda será
 * definido. Ajuste aqui (limites, preço e textos) quando decidir.
 */
export const TRIAL_DAYS = 14;

/** true = trial expirado bloqueia /app e redireciona para /pricing (padrão do boilerplate). */
export const BLOCK_WHEN_TRIAL_EXPIRES = true;

export const PRO_PRICE_LABEL = "R$ 14,90/mês"; // provisório

export type LimitedResource = "activeTrips" | "itemsPerTrip";

export const PLAN_LIMITS: Record<Plan, Record<LimitedResource, number>> = {
  FREE: {
    activeTrips: 1, // viagens com status PLANNING/ONGOING
    itemsPerTrip: 15,
  },
  TRIAL: {
    activeTrips: Number.POSITIVE_INFINITY,
    itemsPerTrip: Number.POSITIVE_INFINITY,
  },
  PRO: {
    activeTrips: Number.POSITIVE_INFINITY,
    itemsPerTrip: Number.POSITIVE_INFINITY,
  },
};

export const PRO_FEATURES = [
  "Viagens ilimitadas",
  "Roteiro com itens ilimitados",
  "Estimar Gastos e Ver Progresso completos",
  "Em breve: planejamento colaborativo e lembretes do roteiro",
];
