"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { DESTINATIONS, MOST_SEARCHED, distanceKm, getDestination, searchDestinations, type Destination } from "@/lib/catalog";
import { toursUrl } from "@/lib/partners";
import { ScreenHeader } from "@/components/buscar/screen-header";

/* eslint-disable @next/next/no-img-element */

/**
 * Passeios e Atrações — Figma 247:1328. Busca entre os destinos do catálogo; "Destinos Próximos"
 * ordena por distância usando a localização do aparelho (só quando a pessoa toca no botão).
 */
type Nearby = { status: "idle" | "loading" } | { status: "done"; list: { d: Destination; km: number }[] };

export function PasseiosScreen() {
  const [query, setQuery] = useState("");
  const [nearby, setNearby] = useState<Nearby>({ status: "idle" });
  const searching = query.trim().length > 0;
  const results = searchDestinations(query);

  function findNearby() {
    if (!("geolocation" in navigator)) return toast.error("Seu navegador não informa a localização.");
    setNearby({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const here = { lat: coords.latitude, lon: coords.longitude };
        const list = DESTINATIONS.map((d) => ({ d, km: distanceKm(here, d) })).sort((a, b) => a.km - b.km);
        setNearby({ status: "done", list });
        setQuery("");
      },
      () => {
        setNearby({ status: "idle" });
        toast.error("Não foi possível usar sua localização. Verifique a permissão do navegador.");
      },
      { timeout: 10000, maximumAge: 10 * 60 * 1000 },
    );
  }

  const list: { d: Destination; km?: number }[] = searching
    ? results.map((d) => ({ d }))
    : nearby.status === "done"
      ? nearby.list
      : MOST_SEARCHED.flatMap((slug) => {
          const d = getDestination(slug);
          return d ? [{ d }] : [];
        });
  const listTitle = searching ? "Resultados" : nearby.status === "done" ? "Destinos próximos de você" : "Destinos mais procurados";

  return (
    <main className="flex flex-1 flex-col px-6 pt-16 pb-14">
      <ScreenHeader back="/app/buscar" backLabel="Voltar para Buscar" title="Passeios e Atrações" />

      {/* Campo de busca (Figma "Text Field with icon"): ícone 22 + texto 16, linha de preenchimento */}
      <label className="mt-[39px] flex h-6 items-center gap-2 border-b border-tripper-dark-300 focus-within:border-primary">
        <img src="/icons/buscar/search.svg" alt="" width={22} height={22} className="size-[22px] shrink-0" />
        <span className="sr-only">Qual seu próximo destino?</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Qual seu próximo destino?"
          enterKeyHint="search"
          className="h-full min-w-0 flex-1 bg-transparent text-p16 leading-[1.2] text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
      </label>

      <button
        type="button"
        onClick={findNearby}
        disabled={nearby.status === "loading"}
        className="mt-9 flex items-center gap-4 self-start text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
      >
        <span className="flex size-16 items-center justify-center rounded-[12px] bg-tripper-light-300">
          <img src="/icons/buscar/nearby.svg" alt="" width={32} height={32} className="size-8" />
        </span>
        <span className="w-16 text-p14 leading-[1.2] font-medium text-muted-foreground">
          {nearby.status === "loading" ? "Buscando…" : "Destinos Próximos"}
        </span>
      </button>

      <h2 className="mt-9 text-p16 leading-[1.2] font-medium text-foreground" aria-live="polite">
        {listTitle}
      </h2>

      {list.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-4">
          {list.map(({ d, km }) => (
            <li key={d.slug}>
              <Link href={`/app/buscar/passeios/${d.slug}`} className="group flex items-center gap-4 outline-none">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-[12px] ring-ring/50 group-focus-visible:ring-3">
                  <Image src={d.photo} alt="" fill sizes="64px" style={{ objectPosition: d.photoPosition }} className="object-cover" />
                </span>
                <span className="flex flex-col text-p14 leading-[1.2] font-medium text-muted-foreground">
                  {d.name}
                  {km !== undefined && <span className="mt-1 font-normal">a {Math.round(km).toLocaleString("pt-BR")} km</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        // Destino fora do catálogo: busca de passeios no parceiro
        <p className="mt-4 text-p14 leading-[1.6] text-muted-foreground">
          Ainda não temos atrações de “{query.trim()}” no Tripper.{" "}
          <a href={toursUrl(query.trim())} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-medium text-primary">
            Ver passeios no GetYourGuide
            <img src="/icons/buscar/external-blue.svg" alt="" width={16} height={16} className="size-4" />
            <span className="sr-only">(abre em nova aba)</span>
          </a>
        </p>
      )}
    </main>
  );
}
