"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toursUrl } from "@/lib/partners";
import type { Attraction, Destination } from "@/lib/catalog";
import { ScreenHeader } from "@/components/buscar/screen-header";

/* eslint-disable @next/next/no-img-element */

const PAGE = 5; // Figma: 5 cards e "Mostrar mais"

/**
 * Destino Pesquisado — Figma 272:1307. Atrações reais do destino (resumo e foto da Wikipédia).
 * Sem "Ordenar/Filtros/Datas", nota e preço: voltam quando houver dados de parceiros.
 */
export function DestinoScreen({ destination, attractions }: { destination: Destination; attractions: Attraction[] }) {
  const [shown, setShown] = useState(PAGE);
  const count = attractions.length;

  return (
    <main className="flex flex-1 flex-col px-6 pt-16 pb-7">
      <ScreenHeader back="/app/buscar/passeios" backLabel="Voltar para Passeios e Atrações" title={destination.name} />

      <p className="mt-[31px] text-p14 leading-[1.2] text-foreground">
        {count} {count === 1 ? "passeio e atração" : "passeios e atrações"}
      </p>
      <h2 className="mt-6 text-p16 leading-[1.2] font-medium text-foreground">Conheça estas experiências para sua próxima viagem</h2>

      <ul className="mt-4 flex flex-col">
        {attractions.slice(0, shown).map((a, i) => (
          <li key={a.slug} className={i > 0 ? "border-t border-tripper-divider pt-6" : undefined}>
            <Link
              href={`/app/buscar/passeios/${destination.slug}/${a.slug}`}
              className="group flex gap-4 pb-6 outline-none"
            >
              <span className="relative size-[102px] shrink-0 overflow-hidden rounded-[12px] ring-ring/50 group-focus-visible:ring-3">
                <Image src={a.image} alt="" fill sizes="102px" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              </span>
              <span className="flex min-w-0 flex-col pt-[9px]">
                <span className="text-p14 leading-[1.2] font-medium text-foreground">{a.name}</span>
                <span className="mt-1 line-clamp-3 text-p14 leading-[1.6] text-muted-foreground">{a.subtitle ?? firstSentence(a.summary)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {shown < count ? (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE)}
          className="mt-2 flex items-center justify-center gap-1 self-center text-p14 leading-[1.2] font-medium text-primary"
        >
          <img src="/icons/buscar/mostrar-mais.svg" alt="" width={18} height={18} className="size-[18px]" />
          Mostrar mais
        </button>
      ) : (
        <a
          href={toursUrl(destination.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-1 self-center text-p14 leading-[1.2] font-medium text-primary"
        >
          Mais passeios em {destination.name} no GetYourGuide
          <img src="/icons/buscar/external-blue.svg" alt="" width={16} height={16} className="size-4" />
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      )}
    </main>
  );
}

function firstSentence(text: string) {
  const m = text.match(/^.+?[.!?](\s|$)/);
  return (m ? m[0] : text).trim();
}
