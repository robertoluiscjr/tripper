import Link from "next/link";
import { CalendarRange, Map, PiggyBank, Plane, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

/**
 * Landing page (Etapa 0: "hello world" no ar).
 * Será expandida na Etapa 7: Hero → Features → Screenshots → Pricing → Footer.
 */
const features = [
  { icon: Route, title: "Roteiro passo a passo", text: "Monte seu roteiro dia a dia e arraste os itens na linha do tempo." },
  { icon: PiggyBank, title: "Estimar Gastos", text: "Defina quanto quer gastar e acompanhe quanto ainda tem disponível." },
  { icon: Map, title: "Tudo no mapa", text: "Visualize os pontos de interesse e otimize o tempo de cada dia." },
  { icon: Plane, title: "Compras em um só lugar", text: "Passagens, hospedagens e passeios integrados ao seu planejamento." },
];

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-primary px-6 pb-16 pt-10 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <header className="flex items-center justify-between">
            <Logo variant="white" className="text-[36px]" />
            <Button asChild variant="outline" className="border-white bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white">
              <Link href="/login">Entrar</Link>
            </Button>
          </header>
          <div className="flex max-w-2xl flex-col gap-5">
            <h1 className="text-h1 font-semibold leading-tight md:text-5xl">
              Planeje sua próxima viagem e tenha uma experiência inesquecível
            </h1>
            <p className="text-p16 text-white/85">
              Elabore um roteiro personalizado, estime os gastos da viagem e
              acompanhe a evolução do seu planejamento — do sonho à compra, em um só lugar.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="cta" variant="secondary" className="sm:w-auto">
                <Link href="/login">
                  <CalendarRange /> Comece a planejar grátis
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col gap-2 rounded-2xl bg-muted p-5">
              <Icon className="size-6 text-primary" />
              <h2 className="text-h6 font-medium text-foreground">{title}</h2>
              <p className="text-p14 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto border-t px-6 py-6 text-center text-small text-muted-foreground">
        Tripper · Estudo de caso de UX/UI e Product Design — Roberto Luís Coelho
      </footer>
    </main>
  );
}
