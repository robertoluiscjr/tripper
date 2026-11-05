import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { HomeHeader } from "@/components/home/home-header";
import { HomeCard } from "@/components/home/home-card";

export const metadata: Metadata = { title: "Home" };

/**
 * Home — Figma "Home (logado)" 3359:5394 e "Home (pré-login)" 2209:2508.
 * Nova Home do 2º teste: saudação + principais funcionalidades do app.
 */
export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="relative flex-1 pb-6">
      <HomeHeader name={user ? (user.name ?? "") : undefined} image={user?.image} />

      <div className="relative flex flex-col gap-6 px-6 pt-[189px]">
        <HomeCard
          href="/app/planejar"
          title="Planeje uma nova viagem"
          description="Comece a planejar sua próxima experiência de viagem, elaborando o roteiro, estimando os gastos e muito mais"
          image="/images/home/planeje.webp"
          imageTop="-6.29%"
          priority
        />
        <HomeCard
          href="/app/buscar"
          title="Busque destinos imperdíveis"
          description="Ainda não sabe para onde será sua próxima viagem? Explore dicas e ofertas para destinos incríveis"
          image="/images/home/busque.webp"
          imageTop="0"
          imageFrame={{ left: "-9.47%", width: "118.93%" }}
          gradient="linear-gradient(180deg, rgba(255,255,255,0) 77.644%, rgba(74,74,74,0.35) 85.498%, rgba(0,0,0,0.5) 93.51%)"
        />
        <HomeCard
          href="/app/planejar"
          title="Continue os planos de viagem"
          description="Acesse os planejamentos de viagem que está elaborando ou revisite suas viagens realizadas"
          image="/images/home/continue.webp"
          imageTop="-3.38%"
        />
      </div>
    </main>
  );
}
