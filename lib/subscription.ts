import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { PLAN_LIMITS, type LimitedResource } from "@/lib/plans";

type SubscriptionUser = Pick<
  User,
  "plan" | "trialEndsAt" | "stripeCurrentPeriodEnd"
>;

const DAY_MS = 24 * 60 * 60 * 1000;

/** trialEndsAt > agora E plan === TRIAL */
export function isTrialActive(user: SubscriptionUser): boolean {
  return (
    user.plan === "TRIAL" &&
    !!user.trialEndsAt &&
    user.trialEndsAt.getTime() > Date.now()
  );
}

/** plan === PRO E stripeCurrentPeriodEnd > agora (cancelado mantém acesso até o fim do período) */
export function isSubscribed(user: SubscriptionUser): boolean {
  return (
    user.plan === "PRO" &&
    !!user.stripeCurrentPeriodEnd &&
    user.stripeCurrentPeriodEnd.getTime() > Date.now()
  );
}

/** Acesso total: trial ativo OU assinante */
export function hasAccess(user: SubscriptionUser): boolean {
  return isTrialActive(user) || isSubscribed(user);
}

export function daysLeftInTrial(user: SubscriptionUser): number {
  if (!isTrialActive(user) || !user.trialEndsAt) return 0;
  return Math.max(
    0,
    Math.ceil((user.trialEndsAt.getTime() - Date.now()) / DAY_MS),
  );
}

/** Plano efetivo para aplicar limites (trial expirado conta como FREE). */
export function effectivePlan(user: SubscriptionUser) {
  if (isSubscribed(user)) return "PRO" as const;
  if (isTrialActive(user)) return "TRIAL" as const;
  return "FREE" as const;
}

export type UsageCheck = {
  allowed: boolean;
  used: number;
  limit: number;
};

/**
 * Verifica se o usuário pode criar mais um recurso.
 * `tripId` é obrigatório para "itemsPerTrip".
 */
export async function checkUsageLimit(
  user: SubscriptionUser & { id: string },
  resource: LimitedResource,
  opts: { tripId?: string } = {},
): Promise<UsageCheck> {
  const limit = PLAN_LIMITS[effectivePlan(user)][resource];

  let used = 0;
  if (resource === "activeTrips") {
    used = await db.trip.count({
      where: { userId: user.id, status: { in: ["PLANNING", "ONGOING"] } },
    });
  } else if (resource === "itemsPerTrip") {
    if (!opts.tripId) throw new Error("tripId é obrigatório para itemsPerTrip");
    used = await db.tripItem.count({ where: { tripId: opts.tripId } });
  }

  return { allowed: used < limit, used, limit };
}
