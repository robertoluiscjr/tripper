import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { PLAN_LIMITS, PRO_FEATURES, PRO_PRICE_LABEL, TRIAL_DAYS } from "@/lib/plans";

export const metadata: Metadata = { title: "Planos" };

export default function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
      <Link href="/"><Logo /></Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-h2 font-semibold text-foreground">Escolha seu plano</h1>
        <p className="text-p15 text-muted-foreground">
          Teste tudo grátis por {TRIAL_DAYS} dias. Depois, continue no plano gratuito ou assine o Tripper PRO.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl border p-6">
          <h2 className="text-h5 font-medium text-foreground">Gratuito</h2>
          <p className="text-h3 font-semibold text-foreground">R$ 0</p>
          <ul className="flex flex-col gap-2 text-p14 text-muted-foreground">
            <li>{PLAN_LIMITS.FREE.activeTrips} viagem ativa por vez</li>
            <li>Até {PLAN_LIMITS.FREE.itemsPerTrip} itens no roteiro</li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border-2 border-primary p-6">
          <h2 className="text-h5 font-medium text-primary">Tripper PRO</h2>
          <p className="text-h3 font-semibold text-foreground">{PRO_PRICE_LABEL}</p>
          <ul className="flex flex-col gap-2 text-p14 text-foreground">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-success" />{f}</li>
            ))}
          </ul>
          <Button asChild size="cta" className="mt-auto">
            <Link href="/settings/billing">Fazer upgrade</Link>
          </Button>
        </div>
      </div>
      <p className="text-small text-muted-foreground">Valores provisórios — modelo de monetização em definição.</p>
    </main>
  );
}
