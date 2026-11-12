"use client";

import { useEffect } from "react";
import type { ItemCategory } from "@prisma/client";
import { CATEGORY_MENU } from "@/lib/trip-items";

/* eslint-disable @next/next/no-img-element */

/**
 * Menu "Novo Item" (Figma 3484:3490): fundo preto 85% sobre a Tela da Viagem (a tab bar continua
 * visível por cima), botões claros de 56px empilhados a cada 72px, rótulo à esquerda.
 * O botão "+" vira "×" e fica acima do fundo (ver TripScreen).
 * Abre com "Dissolve" de 300ms, Ease out; fecha na hora (como no protótipo).
 */
export function NewItemMenu({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (category: ItemCategory) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-y-0 left-1/2 z-[35] w-full max-w-md -translate-x-1/2 animate-in bg-black/85 duration-300 ease-figma-out fade-in"
      onClick={onClose}
    >
      {/* 32px acima do "+" (que fica a 104px do rodapé: tab bar 72 + 32) */}
      <ul
        role="menu"
        aria-label="Adicionar item ao roteiro"
        className="absolute right-6 bottom-[192px] flex flex-col items-end gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {CATEGORY_MENU.map(({ category, label, icon }) => (
          <li key={category}>
            <button
              type="button"
              role="menuitem"
              onClick={() => onPick(category)}
              className="flex items-center gap-4 outline-none"
            >
              <span className="text-h5 leading-[1.2] font-medium text-tripper-light-200">{label}</span>
              <span className="flex size-14 items-center justify-center rounded-full bg-tripper-light-200">
                <img src={icon} alt="" width={28} height={28} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
