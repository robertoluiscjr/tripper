import Image from "next/image";
import Link from "next/link";
import { BUSCAR_SECTIONS, getDestination, sectionUrl, type BuscarSection } from "@/lib/catalog";

/* eslint-disable @next/next/no-img-element */

/**
 * Buscar — Figma 214:2332. Sem compra no app (por enquanto): os cards abrem a busca do destino
 * no site parceiro; "Passeios e Atrações" fica dentro do app, com atrações reais.
 * Sem preços: o "a partir de R$…" do protótipo só volta com dados de parceiros.
 */
const CATEGORIES = [
  { label: "Passagens", icon: "/icons/buscar/flight.svg", href: "#passagens" },
  { label: "Hospedagens", icon: "/icons/buscar/cat-hospedagens.svg", href: "#hospedagens" },
  { label: "Passeios e Atrações", icon: "/icons/buscar/cat-passeios.svg", href: "/app/buscar/passeios" },
  { label: "Pacotes", icon: "/icons/buscar/cat-pacotes.svg", href: "#pacotes" },
];

export function BuscarScreen() {
  return (
    <main className="flex flex-1 flex-col px-6 pt-[72px] pb-14">
      <h1 className="text-h1 leading-[normal] font-semibold text-foreground">Buscar</h1>

      {/* Categorias: 4 botões de 82 × 114 (círculo de 72px), 9px entre eles */}
      <nav aria-label="Categorias" className="-mx-6 mt-8 flex justify-center gap-[9px]">
        {CATEGORIES.map((c) => (
          <Link key={c.label} href={c.href} className="group flex w-[82px] flex-col items-center text-center outline-none">
            <span className="flex size-[72px] items-center justify-center rounded-full bg-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] ring-ring/50 transition-colors group-hover:bg-tripper-blue-100 group-focus-visible:ring-3 group-active:bg-tripper-blue-100">
              <img src={c.icon} alt="" width={36} height={36} className="size-9" />
            </span>
            <span className="mt-2 text-p14 leading-[1.2] text-foreground">{c.label}</span>
          </Link>
        ))}
      </nav>

      {/* Campo de busca (Figma "Text Field with icon"): leva à tela Passeios e Atrações */}
      <Link
        href="/app/buscar/passeios"
        className="mt-8 flex h-6 items-center gap-2 border-b border-tripper-dark-300 text-p16 leading-[1.2] text-muted-foreground outline-none focus-visible:border-primary"
      >
        <img src="/icons/buscar/search.svg" alt="" width={22} height={22} className="size-[22px]" />
        Buscar Passeios e Atrações
      </Link>

      {BUSCAR_SECTIONS.map((section, i) => (
        <Section key={section.id} section={section} first={i === 0} />
      ))}
    </main>
  );
}

function Section({ section, first }: { section: BuscarSection; first: boolean }) {
  return (
    <section id={section.id} aria-labelledby={`${section.id}-titulo`} className={first ? "mt-[43px] scroll-mt-6" : "mt-[25px] scroll-mt-6"}>
      <div className="flex h-7 items-center gap-2">
        <img src={section.icon} alt="" width={28} height={28} className="size-7" />
        <h2 id={`${section.id}-titulo`} className="text-h6 leading-[1.2] font-medium text-foreground">
          {section.title}
        </h2>
      </div>
      {/* Carrossel: cards de 160px, 16px entre eles, rolagem lateral até a borda da tela */}
      <ul className="-mx-6 mt-[11px] flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 py-1 [scrollbar-width:none]">
        {section.cards.map((card) => {
          const d = getDestination(card.destination);
          if (!d) return null;
          return (
            <li key={d.slug} className="snap-start">
              <DestinationCard
                href={sectionUrl(section.id, d)}
                name={d.name}
                photo={card.photo ?? d.photo}
                photoPosition={card.photo ? undefined : d.photoPosition}
                kind={section.kind}
                partner={section.partner}
                partnerPrep={section.partnerPrep}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** "Small Card (new)" 160 × 160: foto de 120px, nome em branco sobre a foto, tipo + parceiro embaixo. */
function DestinationCard({
  href,
  name,
  photo,
  photoPosition,
  kind,
  partner,
  partnerPrep,
}: {
  href: string;
  name: string;
  photo: string;
  photoPosition?: string;
  kind: string;
  partner: string;
  partnerPrep: "na" | "no";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${kind} para ${name} ${partnerPrep} ${partner} (abre em nova aba)`}
      className="group relative block size-40 overflow-hidden rounded-[12px] bg-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] outline-none ring-ring/50 focus-visible:ring-3"
    >
      <span className="relative block h-[120px] overflow-hidden">
        <Image
          src={photo}
          alt=""
          fill
          sizes="160px"
          style={{ objectPosition: photoPosition }}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_55%,rgba(0,0,0,0.45)_100%)]" />
        <span className="absolute top-[99px] right-2 left-2 truncate text-p14 leading-[1.2] font-semibold text-white">{name}</span>
      </span>
      <span className="absolute top-[125px] right-2 left-2 text-small leading-[1.2] text-foreground">
        <span className="block font-semibold">{kind}</span>
        <span className="flex items-center gap-0.5">
          Ver {partnerPrep} {partner}
          <img src="/icons/buscar/external-dark.svg" alt="" width={12} height={12} className="size-3" />
        </span>
      </span>
    </a>
  );
}
