import Link from "next/link";

/* eslint-disable @next/next/no-img-element */

/**
 * Topo das telas internas da aba Buscar (Figma "Passeios e Atrações", "Destino Pesquisado"):
 * voltar (24px, x 24) + título 18 Medium (x 72) e ações à direita.
 */
export function ScreenHeader({ back, backLabel, title, children }: { back: string; backLabel: string; title?: string; children?: React.ReactNode }) {
  return (
    <header className="flex h-6 items-center gap-6">
      <Link href={back} aria-label={backLabel} className="shrink-0">
        <img src="/icons/back.svg" alt="" width={24} height={24} />
      </Link>
      {title && <h1 className="min-w-0 flex-1 truncate text-h6 leading-[1.2] font-medium text-foreground">{title}</h1>}
      {children && <div className="ml-auto flex items-center gap-6">{children}</div>}
    </header>
  );
}
