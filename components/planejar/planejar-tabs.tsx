"use client";

import { cn } from "@/lib/utils";

export type PlanejarTab = "proximas" | "anteriores";

/**
 * "Title + Subtitle" do Figma: título "Planejar" (32 SemiBold) e as abas
 * "Próximas Viagens" / "Viagens Anteriores" com a Linha de Seleção azul (80 × 3).
 */
export function PlanejarHeader({
  tab,
  onTabChange,
}: {
  tab: PlanejarTab;
  onTabChange: (tab: PlanejarTab) => void;
}) {
  return (
    <div className="px-6 pt-[72px]">
      <h1 className="text-h1 leading-[normal] font-semibold text-foreground">Planejar</h1>
      <div role="tablist" aria-label="Viagens" className="mt-6 grid grid-cols-2">
        <TabButton active={tab === "proximas"} onClick={() => onTabChange("proximas")} className="w-20 justify-self-start">
          Próximas
          <br />
          Viagens
        </TabButton>
        <TabButton active={tab === "anteriores"} onClick={() => onTabChange("anteriores")} className="ml-[10.5px] justify-self-start">
          Viagens
          <br />
          Anteriores
        </TabButton>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  className,
  children,
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn("relative flex w-[92px] flex-col items-center pb-[5px] text-center", className)}
    >
      <span className="text-h5 leading-[1.2] font-medium text-foreground">{children}</span>
      {/* Linha de Seleção (Figma 214:899) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/linha-selecao.svg"
        alt=""
        width={80}
        height={3}
        className={cn("mt-[3px] transition-opacity", active ? "opacity-100" : "opacity-0")}
      />
    </button>
  );
}
