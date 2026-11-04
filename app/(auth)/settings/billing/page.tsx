import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { daysLeftInTrial, effectivePlan, isSubscribed } from "@/lib/subscription";
import { PRO_FEATURES, PRO_PRICE_LABEL } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { BillingActions } from "./billing-actions";

export const metadata: Metadata = { title: "Meu plano" };

const PLAN_LABEL = { FREE: "Gratuito", TRIAL: "Teste grátis", PRO: "Tripper PRO" } as const;

export default async function BillingPage() {
  const user = await requireUser();
  const plan = effectivePlan(user);
  const subscribed = isSubscribed(user);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-8">
      <Link href="/app" aria-label="Voltar"><ChevronLeft className="size-6" /></Link>
      <h1 className="text-h3 font-medium text-foreground">Meu plano</h1>

      <div className="flex flex-col gap-3 rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <span className="text-p16 font-medium text-foreground">Plano atual</span>
          <Badge variant={plan === "PRO" ? "default" : "secondary"}>{PLAN_LABEL[plan]}</Badge>
        </div>
        {plan === "TRIAL" && (
          <p className="text-p14 text-muted-foreground">
            {daysLeftInTrial(user)} dia(s) restante(s) de teste. Faça upgrade a qualquer momento — vale na hora.
          </p>
        )}
        {subscribed && user.stripeCurrentPeriodEnd && (
          <p className="text-p14 text-muted-foreground">
            Próxima renovação em {user.stripeCurrentPeriodEnd.toLocaleDateString("pt-BR")}.
          </p>
        )}
      </div>

      {!subscribed && (
        <div className="flex flex-col gap-2 rounded-2xl bg-muted p-5">
          <p className="text-p16 font-medium text-foreground">Tripper PRO · {PRO_PRICE_LABEL}</p>
          <ul className="text-p14 text-muted-foreground">
            {PRO_FEATURES.map((f) => <li key={f}>• {f}</li>)}
          </ul>
        </div>
      )}

      <BillingActions subscribed={subscribed} hasCustomer={!!user.stripeCustomerId} />
    </main>
  );
}
