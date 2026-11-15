"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { attractionToursUrl, type Attraction, type Destination } from "@/lib/catalog";
import { PARTNER_NAME } from "@/lib/partners";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/buscar/screen-header";
import { AddToTripSheet } from "@/components/buscar/add-to-trip-sheet";

/* eslint-disable @next/next/no-img-element */

/**
 * Descrição do Passeio — Figma 3806:4707. Sem compra no app: o rodapé "Reservar" do protótipo
 * vira "Adicionar à viagem" (sheet "Adicionar Compra", 296:1732) + "Ver no parceiro" (site externo).
 * Sem nota, preço, data/pessoas/horário/idioma: isso só com dados do parceiro.
 */
export function PasseioScreen({ destination, attraction }: { destination: Destination; attraction: Attraction }) {
  const [expanded, setExpanded] = useState(false);
  const [adding, setAdding] = useState(false);
  const partnerUrl = attractionToursUrl(attraction);
  const place = `${destination.name} - ${destination.state}`;
  const long = attraction.summary.length > 420; // ~7 linhas de 345px em 15px

  async function share() {
    const data = { title: attraction.name, text: `${attraction.name} — ${place}`, url: window.location.href };
    try {
      if (navigator.share) return await navigator.share(data);
      await navigator.clipboard.writeText(data.url);
      toast.success("Link copiado");
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") toast.error("Não foi possível compartilhar o link.");
    }
  }

  return (
    <main className="flex flex-1 flex-col pt-16">
      <div className="px-6">
        <ScreenHeader back={`/app/buscar/passeios/${destination.slug}`} backLabel={`Voltar para ${destination.name}`}>
          <button type="button" onClick={share} aria-label="Compartilhar">
            <img src="/icons/buscar/share.svg" alt="" width={24} height={24} />
          </button>
        </ScreenHeader>
      </div>

      {/* Foto 393 × 256 com o gradiente do Figma ("Images with grad") */}
      <div className="relative mt-6 h-64 w-full overflow-hidden bg-tripper-light-500">
        <Image src={attraction.image} alt={`Foto: ${attraction.name}`} fill priority sizes="(max-width: 448px) 100vw, 448px" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_82.45%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      <div className="flex flex-col px-6 pb-12">
        <h1 className="mt-4 text-h2 leading-[normal] font-semibold tracking-[-0.05em] text-foreground">{attraction.name}</h1>
        <p className="mt-4 text-p16 leading-[1.2] font-medium text-foreground">{attraction.subtitle ?? place}</p>

        <h2 className="mt-8 text-h5 leading-[1.2] font-medium text-foreground">Descrição</h2>
        <p className={cn("mt-3 text-p15 leading-[1.2] whitespace-pre-line text-foreground", !expanded && long && "line-clamp-7")}>{attraction.summary}</p>
        {long && (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="mt-1.5 flex items-center gap-1 self-start text-p14 leading-[1.2] font-medium text-primary"
          >
            {expanded ? "Ler menos" : "Ler mais"}
            <img src="/icons/buscar/ler-mais.svg" alt="" width={14} height={14} className={cn("size-3.5 transition-transform duration-250 ease-figma-out", expanded && "rotate-180")} />
          </button>
        )}

        <h2 className="mt-8 text-h5 leading-[1.2] font-medium text-foreground">Informações</h2>
        <div className="mt-5 flex flex-col">
          <Info title="Localização" first>
            <p>{place}</p>
            <ExternalLink href={`https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query: `${attraction.name}, ${destination.query}` })}`}>
              Ver no Google Maps
            </ExternalLink>
          </Info>
          <Info title="Reservas e preços">
            <p>
              Ingressos, horários e preços são consultados no site do {PARTNER_NAME.getyourguide}. O Tripper não vende nem cobra pelo passeio.
            </p>
            <ExternalLink href={partnerUrl}>Ver no {PARTNER_NAME.getyourguide}</ExternalLink>
          </Info>
          <Info title="Fonte das informações" last>
            <p>Texto e foto: Wikipédia, a enciclopédia livre (licença CC BY-SA 4.0).</p>
            <ExternalLink href={attraction.wikiUrl}>Ler o artigo completo</ExternalLink>
          </Info>
        </div>
      </div>

      {/* Rodapé fixo acima da tab bar (Figma "Reservar": 88px, linha #D9D9D9 em cima) */}
      <div className="sticky bottom-[72px] z-30 mt-auto flex h-[88px] items-center gap-4 border-t border-tripper-divider bg-white px-6">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-p15 leading-[1.2] font-medium text-primary"
        >
          <img src="/icons/add-circle.svg" alt="" width={24} height={24} className="size-6 shrink-0" />
          <span>
            Adicionar
            <br />à viagem
          </span>
        </button>
        <Button asChild size="cta" className="w-[216px] shrink-0 gap-2">
          <a href={partnerUrl} target="_blank" rel="noopener noreferrer">
            Ver no parceiro
            <img src="/icons/buscar/external-white.svg" alt="" width={22} height={22} className="size-[22px]" />
            <span className="sr-only">(GetYourGuide, abre em nova aba)</span>
          </a>
        </Button>
      </div>

      <AddToTripSheet
        open={adding}
        onOpenChange={setAdding}
        title={attraction.name}
        address={`${attraction.name}, ${destination.name} - ${destination.state}`}
      />
    </main>
  );
}

/** Linha do acordeão "Informações" (Figma "Text Field with icon (alt.)": 16 Regular + seta 22). */
function Info({ title, first, last, children }: { title: string; first?: boolean; last?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn(!first && "pt-4", !last && "border-b border-tripper-divider pb-4")}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex h-6 w-full items-center justify-between text-left text-p16 leading-[1.2] text-foreground">
        {title}
        <img src="/icons/buscar/down.svg" alt="" width={22} height={22} className={cn("size-[22px] transition-transform duration-250 ease-figma-out", open && "rotate-180")} />
      </button>
      {open && <div className="mt-3 flex animate-in flex-col gap-2 text-p14 leading-[1.6] text-muted-foreground duration-250 fade-in">{children}</div>}
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 self-start font-medium text-primary">
      {children}
      <img src="/icons/buscar/external-blue.svg" alt="" width={16} height={16} className="size-4" />
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  );
}
