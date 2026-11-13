"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SEARCH_MODES, SEARCH_ORDER, type SearchMode } from "@/lib/catalog";

/* eslint-disable @next/next/no-img-element */

/**
 * Categorias + campo de busca da tela Buscar (Figma 2133:3289 e 214:2582).
 * Tocar numa categoria a deixa marcada em azul (como "Passeios e Atrações" no protótipo) e o
 * campo embaixo passa a buscar nela: "Buscar Passagens", "Buscar Hospedagens"…
 * Círculos de margem a margem: em 393px são 72px com 19px entre eles; em telas mais largas
 * crescem na mesma proporção (ícone = metade do círculo).
 */
export function CategorySearch() {
  const [mode, setMode] = useState<SearchMode>("passeios");
  const current = SEARCH_MODES[mode];

  return (
    <>
      <div role="radiogroup" aria-label="O que você quer buscar?" className="mt-8 grid grid-cols-4 gap-x-[calc(100%*19/345)]">
        {SEARCH_ORDER.map((id) => {
          const m = SEARCH_MODES[id];
          const selected = id === mode;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setMode(id)}
              className="group flex min-w-0 flex-col items-center text-center outline-none"
            >
              <span
                className={cn(
                  "flex aspect-square w-full items-center justify-center rounded-full shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] ring-ring/50 transition-colors duration-250 ease-figma-out group-focus-visible:ring-3",
                  selected ? "bg-primary" : "bg-white group-hover:bg-tripper-blue-100",
                )}
              >
                <img src={`${m.icon}${selected ? "-white" : ""}.svg`} alt="" width={36} height={36} className="aspect-square w-1/2" />
              </span>
              {/* rótulo 10px mais largo que o círculo (82 × 72 no Figma) */}
              <span className="-mx-[5px] mt-2 text-p14 leading-[1.2] text-foreground">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Campo de busca (Figma "Text Field with icon"): abre a busca da categoria escolhida */}
      <Link
        href={current.href}
        className="mt-8 flex h-6 items-center gap-2 border-b border-tripper-dark-300 text-p16 leading-[1.2] text-muted-foreground outline-none focus-visible:border-primary"
      >
        <img src="/icons/buscar/search.svg" alt="" width={22} height={22} className="size-[22px]" />
        Buscar {current.label}
      </Link>
    </>
  );
}
