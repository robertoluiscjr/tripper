import Image from "next/image";
import { Carousel } from "@/components/buscar/carousel";
import { CategorySearch } from "@/components/buscar/category-search";
import { BUSCAR_SECTIONS, getDestination, sectionUrl, type BuscarSection } from "@/lib/catalog";

/* eslint-disable @next/next/no-img-element */

/**
 * Buscar — Figma 214:2332. Sem compra no app (por enquanto): os cards abrem a busca do destino
 * no site parceiro; "Passeios e Atrações" fica dentro do app, com atrações reais.
 * Sem preços: o "a partir de R$…" do protótipo só volta com dados de parceiros.
 */

export function BuscarScreen() {
  return (
    <main className="flex flex-1 flex-col px-6 pt-[72px] pb-14">
      <h1 className="text-h1 leading-[normal] font-semibold text-foreground">Buscar</h1>

      <CategorySearch />

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
      <Carousel label={section.title} className="-mx-6 mt-[11px] scroll-px-6 gap-4 px-6 py-1">
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
      </Carousel>
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
