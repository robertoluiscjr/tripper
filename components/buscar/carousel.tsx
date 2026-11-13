"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Carrossel horizontal dos cards da aba Buscar. No celular desliza com o dedo (rolagem nativa);
 * no computador também dá para arrastar com o mouse — clicar e puxar para os lados — e rolar
 * com Shift + roda do mouse ou com o trackpad. Um arrasto não abre o card (só um clique abre).
 */
export function Carousel({ className, children, label }: { className?: string; children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  function onPointerDown(e: React.PointerEvent<HTMLUListElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return;
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
  }

  function onPointerMove(e: React.PointerEvent<HTMLUListElement>) {
    const d = drag.current;
    const el = ref.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 5) return; // tolerância: abaixo disso ainda é clique
    if (!d.moved) {
      d.moved = true;
      el.setPointerCapture?.(e.pointerId);
      el.dataset.dragging = ""; // sem snap nem seleção de texto enquanto arrasta
    }
    el.scrollLeft = d.left - dx;
  }

  function endDrag(e: React.PointerEvent<HTMLUListElement>) {
    const el = ref.current;
    if (!drag.current || !el) return;
    if (drag.current.moved) {
      if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
      // devolve o snap: o card mais próximo se encaixa na margem
      delete el.dataset.dragging;
    }
    // mantém "moved" até o click (que vem logo depois do pointerup) para cancelá-lo
    const moved = drag.current.moved;
    drag.current = moved ? { ...drag.current } : null;
    if (moved) setTimeout(() => (drag.current = null), 0);
  }

  return (
    <ul
      ref={ref}
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={(e) => {
        if (drag.current?.moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onDragStart={(e) => e.preventDefault()} // impede o "arrastar link/imagem" nativo do navegador
      className={cn(
        "flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:cursor-grab",
        "data-dragging:cursor-grabbing data-dragging:snap-none data-dragging:select-none",
        className,
      )}
    >
      {children}
    </ul>
  );
}
