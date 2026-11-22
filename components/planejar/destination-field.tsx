"use client";

import { useEffect, useId, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { DestinationPlace } from "@/lib/validations";

/* eslint-disable @next/next/no-img-element */

/**
 * Campo "Para onde você vai?" — Figma "Nova Viagem 3/4/5/6" (5054:6262 · 6333 · 6423 · 6497).
 * Ao digitar, mostra até 5 lugares reais (cartão com sombra e cantos de 12px); escolher um
 * preenche "Florianópolis, SC" e mostra o × para limpar. Combobox do WAI-ARIA: setas, Enter e Esc.
 */
export function DestinationField({
  value,
  place,
  onChange,
  onSelect,
  error,
  autoFocus,
  className,
}: {
  value: string;
  place: DestinationPlace | null;
  onChange: (text: string) => void;
  onSelect: (place: DestinationPlace | null) => void;
  error?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const query = useDebounced(value.trim(), 250);

  const search = useQuery({
    queryKey: ["destinations", query],
    queryFn: async () => {
      const res = await fetch(`/api/destinations?${new URLSearchParams({ q: query })}`);
      if (!res.ok) return [];
      return ((await res.json()) as { places: DestinationPlace[] }).places;
    },
    enabled: !place && query.length >= 2,
    staleTime: 60 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const places = search.data ?? [];
  const typing = !place && value.trim().length >= 2;
  const open = focused && typing && (places.length > 0 || (search.isFetched && !search.isFetching));

  function choose(p: DestinationPlace) {
    onSelect(p);
    onChange(p.label);
    setActive(-1);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !places.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % places.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? places.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault(); // escolhe o lugar em vez de enviar o formulário
      choose(places[active]);
    } else if (e.key === "Escape") {
      setFocused(false);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className={cn("flex h-6 items-end gap-2 border-b border-input pb-[2px] focus-within:line-focus", error && "border-destructive")}>
        <img src="/icons/location.svg" alt="" width={22} height={22} className="shrink-0" />
        <input
          ref={inputRef}
          role="combobox"
          aria-label="Destino"
          aria-expanded={open}
          aria-controls={`${id}-lista`}
          aria-autocomplete="list"
          aria-activedescendant={open && active >= 0 ? `${id}-${active}` : undefined}
          aria-invalid={!!error}
          autoComplete="off"
          autoFocus={autoFocus}
          enterKeyHint="search"
          placeholder="Para onde você vai?"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (place) onSelect(null);
            setActive(-1);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          className="h-[19px] min-w-0 flex-1 bg-transparent text-p16 leading-[1.2] text-foreground outline-none placeholder:text-muted-foreground"
        />
        {value && (
          <button
            type="button"
            aria-label="Limpar destino"
            onClick={() => {
              onChange("");
              onSelect(null);
              inputRef.current?.focus();
            }}
            // área de toque de 44px sem mudar o desenho do campo
            className="relative -mb-[2px] shrink-0 self-center before:absolute before:-inset-[10px] before:content-['']"
          >
            <img src="/icons/close.svg" alt="" width={24} height={24} />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-small text-destructive">{error}</p>}

      <ul
        id={`${id}-lista`}
        role="listbox"
        aria-label="Sugestões de destino"
        hidden={!open}
        className="absolute top-[calc(100%+8px)] right-0 left-0 z-20 animate-in overflow-hidden rounded-[12px] bg-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] duration-150 fade-in"
      >
        {places.length ? (
          places.map((p, i) => (
            <li
              key={`${p.label}-${p.lat}-${p.lon}`}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === active}
              // mousedown: escolhe antes do blur do campo fechar a lista
              onMouseDown={(e) => {
                e.preventDefault();
                choose(p);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex cursor-pointer items-center gap-3 px-4 py-[10px]",
                i < places.length - 1 && "border-b border-tripper-light-500",
                i === active && "bg-tripper-light-300",
              )}
            >
              <img src="/icons/location.svg" alt="" width={24} height={24} className="shrink-0" />
              <span className="flex min-w-0 flex-col gap-[2px]">
                <span className="truncate text-p16 leading-[1.2] text-foreground">{p.name}</span>
                {p.detail && <span className="truncate text-p14 leading-[1.2] text-muted-foreground">{p.detail}</span>}
              </span>
            </li>
          ))
        ) : (
          <li role="option" aria-selected={false} aria-disabled className="px-4 py-3 text-p14 leading-[1.2] text-muted-foreground">
            Nenhum lugar encontrado. Confira o nome ou crie a viagem assim mesmo.
          </li>
        )}
      </ul>
    </div>
  );
}

function useDebounced<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}
