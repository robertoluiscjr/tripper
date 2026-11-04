import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Home" };

/**
 * Home (logado) — placeholder da Etapa 0.
 * Próximo passo: implementar a tela "Home (logado)" do Figma (node 3359:5394):
 * saudação + cards "Planeje uma nova viagem", "Busque destinos imperdíveis",
 * "Continue os planos de viagem" e tab bar (Home, Buscar, Planejar, Conta).
 */
export default async function HomePage() {
  const user = await requireUser();
  const firstName = user.name?.split(" ")[0] ?? "viajante";

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-primary px-6 pb-10 pt-12 text-white">
        <h1 className="text-h3 font-medium">Olá, {firstName}!</h1>
        <p className="mt-2 text-p16 text-white/85">
          Gerencie suas viagens para aproveitá-las ao máximo
        </p>
      </section>
      <section className="mx-auto flex w-full max-w-md flex-col gap-4 p-6">
        <p className="text-p15 text-muted-foreground">
          Infraestrutura pronta. As telas do protótipo serão implementadas aqui.
        </p>
        <Button asChild variant="outline" size="cta">
          <Link href="/settings/billing">Meu plano</Link>
        </Button>
      </section>
    </main>
  );
}
