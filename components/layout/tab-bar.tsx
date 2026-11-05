"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Bottom Menu (Figma: "Bottom Menu (Home|Buscar|Planejar)", 393 × 72).
 * Ícones de 32px; ativo em azul (#2765C2), inativo em cinza.
 */
type Tab = "home" | "buscar" | "planejar" | "conta";

const TABS: { id: Tab; href: string; label: string }[] = [
  { id: "home", href: "/app", label: "Home" },
  { id: "buscar", href: "/app/buscar", label: "Buscar" },
  { id: "planejar", href: "/app/planejar", label: "Planejar" },
  { id: "conta", href: "/app/conta", label: "Conta" },
];

function activeTab(pathname: string): Tab {
  if (pathname.startsWith("/app/buscar")) return "buscar";
  if (pathname.startsWith("/app/planejar") || pathname.startsWith("/app/viagens")) return "planejar";
  if (pathname.startsWith("/app/conta") || pathname.startsWith("/settings")) return "conta";
  return "home";
}

/* eslint-disable @next/next/no-img-element */
function TabIcon({ tab, active, userImage }: { tab: Tab; active: boolean; userImage?: string | null }) {
  switch (tab) {
    case "home":
      return <img src={active ? "/icons/home-active.svg" : "/icons/home.svg"} alt="" width={32} height={32} />;
    case "buscar":
      return <img src={active ? "/icons/buscar-active.svg" : "/icons/buscar.svg"} alt="" width={32} height={32} />;
    case "planejar": {
      // Ícone composto do Figma: mapa (32px) + pin (24px) — 42 × 32
      const suffix = active ? "-active" : "";
      return (
        <span className="relative block h-8 w-[42px]">
          <img src={`/icons/planejar-map${suffix}.svg`} alt="" width={32} height={32} className="absolute top-0 left-0 max-w-none" />
          <img src={`/icons/planejar-pin${suffix}.svg`} alt="" width={24} height={24} className="absolute top-[6px] left-[18px] max-w-none" />
        </span>
      );
    }
    case "conta":
      return userImage ? (
        <span className="flex size-8 items-center justify-center">
          <img
            src={userImage}
            alt=""
            className={cn("size-[26px] rounded-full object-cover", active ? "ring-2 ring-primary" : "ring-[1.5px] ring-tripper-dark-700")}
          />
        </span>
      ) : (
        <img src="/icons/conta.svg" alt="" width={32} height={32} className={cn(active && "rounded-full ring-2 ring-primary")} />
      );
  }
}

/** Barra vazia (mesmo tamanho) exibida por instantes enquanto a sessão carrega. */
export function TabBarPlaceholder() {
  return (
    <div aria-hidden className="sticky bottom-0 z-40 mt-auto h-[72px] w-full bg-white shadow-[0px_-1px_4px_0px_rgba(0,0,0,0.1)]" />
  );
}

export function TabBar({ userImage }: { userImage?: string | null }) {
  const current = activeTab(usePathname());

  return (
    <nav
      aria-label="Navegação principal"
      className="sticky bottom-0 z-40 mt-auto h-[72px] w-full bg-white shadow-[0px_-1px_4px_0px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid h-full grid-cols-4">
        {TABS.map((tab) => {
          const active = current === tab.id;
          return (
            <li key={tab.id} className="flex">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="flex flex-1 flex-col items-center justify-start gap-0 pt-4"
              >
                <TabIcon tab={tab.id} active={active} userImage={userImage} />
                <span className={cn("text-small leading-none", active ? "text-primary" : "text-muted-foreground")}>
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
