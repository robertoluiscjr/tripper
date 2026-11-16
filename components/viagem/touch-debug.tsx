"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Diagnóstico do arraste por toque — só no preview da Vercel (ou com ?debug=toque na URL).
 * Mostra no topo da tela os últimos eventos de toque, rolagem e do dnd-kit, para entender num
 * aparelho de verdade (iPhone) por que um gesto falhou. Nunca aparece no site oficial.
 */
const ENABLED_BY_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

let lines: string[] = [];
const listeners = new Set<() => void>();
let t0 = 0;

export function logTouch(msg: string) {
  if (!active()) return;
  const now = performance.now();
  if (!t0 || now - t0 > 4000) t0 = now; // novo gesto: o relógio recomeça
  lines = [...lines.slice(-9), `${Math.round(now - t0)}ms ${msg}`];
  listeners.forEach((l) => l());
}

function active() {
  if (ENABLED_BY_ENV) return true;
  try {
    return typeof location !== "undefined" && new URLSearchParams(location.search).get("debug") === "toque";
  } catch {
    return false;
  }
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const describe = (el: EventTarget | null) => {
  const e = el as Element | null;
  if (!e?.closest) return "?";
  if (e.closest("[data-drag-handle]")) return "ícone";
  if (e.closest("img")) return "img";
  return e.tagName?.toLowerCase() ?? "?";
};

export function TouchDebug() {
  const log = useSyncExternalStore(subscribe, () => lines, () => lines);
  const on = useSyncExternalStore(subscribe, active, () => false);

  useEffect(() => {
    if (!active()) return;
    let moves = 0;
    let scrolled = false;
    const start = (e: TouchEvent) => {
      moves = 0;
      scrolled = false;
      // Depois do evento terminar: o bloqueio do ícone roda num ouvinte registrado depois deste
      setTimeout(() => logTouch(`touchstart ${describe(e.target)} prevented=${e.defaultPrevented}`));
    };
    // Bolha na janela: chega depois do dnd-kit, então mostra se ele bloqueou a rolagem
    const move = (e: TouchEvent) => {
      if (++moves <= 3 || moves % 15 === 0) {
        const t = e.touches[0];
        logTouch(`touchmove#${moves} cancelable=${e.cancelable} prevented=${e.defaultPrevented} y=${Math.round(t?.clientY ?? 0)}`);
      }
    };
    const end = (e: TouchEvent) => logTouch(`${e.type} (${moves} moves)`);
    const scroll = () => {
      if (!scrolled) logTouch(`scroll y=${Math.round(scrollY)}`);
      scrolled = true;
    };
    const resize = () => logTouch(`resize ${innerWidth}x${innerHeight}`);
    const menu = () => logTouch("contextmenu");
    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", end, { passive: true });
    window.addEventListener("touchcancel", end, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("contextmenu", menu);
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
      window.removeEventListener("touchcancel", end);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      window.removeEventListener("contextmenu", menu);
    };
  }, []);

  if (!on || !log.length) return null;
  return (
    <pre
      aria-hidden
      className="pointer-events-none fixed inset-x-2 top-2 z-[100] rounded-[8px] bg-foreground/85 p-2 font-mono text-[10px] leading-[1.3] whitespace-pre-wrap text-background"
    >
      {log.join("\n")}
    </pre>
  );
}
