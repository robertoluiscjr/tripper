import Link from "next/link";
import type { User } from "@prisma/client";
import { daysLeftInTrial, isTrialActive } from "@/lib/subscription";

/** Banner "X dias restantes" exibido enquanto o trial está ativo. */
export function TrialBanner({ user }: { user: Pick<User, "plan" | "trialEndsAt" | "stripeCurrentPeriodEnd"> }) {
  if (!isTrialActive(user)) return null;
  const days = daysLeftInTrial(user);

  return (
    <div className="flex items-center justify-center gap-2 bg-accent px-4 py-2 text-p14 text-accent-foreground">
      <span>
        {days === 1 ? "Resta 1 dia" : `Restam ${days} dias`} do seu teste grátis.
      </span>
      <Link href="/settings/billing" className="font-semibold text-primary underline-offset-4 hover:underline">
        Fazer upgrade
      </Link>
    </div>
  );
}
