import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRO_FEATURES } from "@/lib/plans";

/**
 * Bloqueia um recurso quando o limite do plano foi atingido.
 * Uso: <PaywallGate allowed={usage.allowed} title="..."> conteúdo </PaywallGate>
 */
export function PaywallGate({
  allowed,
  title = "Você atingiu o limite do plano gratuito",
  description = "Assine o Tripper PRO para continuar planejando sem limites.",
  children,
}: {
  allowed: boolean;
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  if (allowed) return <>{children}</>;

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center shadow-sm">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent">
        <Sparkles className="size-6 text-secondary" />
      </span>
      <h3 className="text-h5 font-medium text-foreground">{title}</h3>
      <p className="text-p14 text-muted-foreground">{description}</p>
      <ul className="text-p14 text-foreground">
        {PRO_FEATURES.map((f) => <li key={f}>• {f}</li>)}
      </ul>
      <Button asChild size="cta">
        <Link href="/settings/billing">Fazer upgrade</Link>
      </Button>
    </div>
  );
}
