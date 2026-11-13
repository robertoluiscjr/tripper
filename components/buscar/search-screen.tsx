"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { DESTINATIONS, SEARCH_MODES, listPhoto, distanceKm, searchDestinations, sectionUrl, suggestedDestinations, type Destination, type SearchMode } from "@/lib/catalog";
import { hotelsUrl, packagesUrl, toursUrl } from "@/lib/partners";
import { ScreenHeader } from "@/components/buscar/screen-header";

/* eslint-disable @next/next/no-img-element */

/**
 * Busca de destino de cada categoria — layout do Figma "Passeios e Atrações" (247:1328).
 * Passeios e Atrações abre a lista de atrações do destino (dentro do app); Passagens,
 * Hospedagens e Pacotes abrem a busca daquele destino no site parceiro.
 * "Destinos Próximos" ordena por distância usando a localização (só quando a pessoa toca).
 */
type Nearby = { status: "idle" | "loading" } | { status: "done"; list: { d: Destination; km: number }[] };

export function SearchScreen({ mode }: { mode: SearchMode }) {
  const config = SEARCH_MODES[mode];
  const [query, setQuery] = useState("");
  const [nearby, setNearby] = useState<Nearby>({ status: "idle" });
  const text = query.trim();
  const searching = text.length > 0;

  function findNearby() {
    if (!("geolocation" in navigator)) return toast.error("Seu navegador não informa a localização.");
    setNearby({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const here = { lat: coords.latitude, lon: coords.longitude };
        setNearby({ status: "done", list: DESTINATIONS.map((d) => ({ d, km: distanceKm(here, d) })).sort((a, b) => a.km - b.km) });
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
    ? searchDestinations(text).map((d) => ({ d }))
    : nearby.status === "done"
      ? nearby.list
      : suggestedDestinations(mode).map((d) => ({ d }));
  const listTitle = searching ? "Resultados" : nearby.status === "done" ? "Destinos próximos de você" : "Destinos mais procurados";

  return (
    <main className="flex flex-1 flex-col px-6 pt-16 pb-14">
      <ScreenHeader back="/app/buscar" backLabel="Voltar para Buscar" title={config.label} />

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
              <DestinationRow mode={mode} destination={d} km={km} />
            </li>
          ))}
        </ul>
      ) : (
        <NotFound mode={mode} text={text} />
      )}
    </main>
  );
}

function DestinationRow({ mode, destination: d, km }: { mode: SearchMode; destination: Destination; km?: number }) {
  const config = SEARCH_MODES[mode];
  const photo = listPhoto(d);
  const content = (
    <>
      <span className="relative size-16 shrink-0 overflow-hidden rounded-[12px] ring-ring/50 group-focus-visible:ring-3">
        <Image src={photo.src} alt="" fill sizes="64px" style={{ objectPosition: photo.position }} className="object-cover" />
      </span>
      <span className="flex flex-col text-p14 leading-[1.2] font-medium text-muted-foreground">
        {d.name}
        {(km !== undefined || config.partner) && (
          <span className="mt-1 flex items-center gap-0.5 font-normal">
            {km !== undefined && `a ${Math.round(km).toLocaleString("pt-BR")} km`}
            {km !== undefined && config.partner && " · "}
            {config.partner && (
              <>
                Ver {config.partnerPrep} {config.partner}
                <img src="/icons/buscar/external-dark.svg" alt="" width={14} height={14} className="size-3.5" />
              </>
            )}
          </span>
        )}
      </span>
    </>
  );

  // Passeios e Atrações: lista de atrações do destino, dentro do app
  if (mode === "passeios")
    return (
      <Link href={`/app/buscar/passeios/${d.slug}`} className="group flex items-center gap-4 outline-none">
        {content}
      </Link>
    );

  return (
    <a
      href={sectionUrl(mode, d)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${config.label} para ${d.name} ${config.partnerPrep} ${config.partner} (abre em nova aba)`}
      className="group flex items-center gap-4 outline-none"
    >
      {content}
    </a>
  );
}

/** Destino fora do catálogo: a busca segue no parceiro. */
function NotFound({ mode, text }: { mode: SearchMode; text: string }) {
  const link =
    mode === "passeios"
      ? { href: toursUrl(text), label: "Ver passeios no GetYourGuide" }
      : mode === "hospedagens"
        ? { href: hotelsUrl(text), label: `Ver hospedagens em “${text}” no Booking.com` }
        : mode === "pacotes"
          ? { href: packagesUrl(), label: "Ver pacotes na Decolar" }
          : { href: "https://www.skyscanner.com.br/", label: "Buscar passagens no Skyscanner" };
  return (
    <p className="mt-4 text-p14 leading-[1.6] text-muted-foreground">
      {mode === "passeios" ? `Ainda não temos atrações de “${text}” no Tripper.` : `“${text}” ainda não está na nossa lista de destinos.`}{" "}
      <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-medium text-primary">
        {link.label}
        <img src="/icons/buscar/external-blue.svg" alt="" width={16} height={16} className="size-4" />
        <span className="sr-only">(abre em nova aba)</span>
      </a>
    </p>
  );
}
