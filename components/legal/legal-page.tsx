import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { LEGAL_UPDATED_AT, SUPPORT_EMAIL } from "@/lib/site";

/** Moldura das páginas legais (Privacidade, Termos): leitura confortável em qualquer tela. */
export function LegalPage({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
      <Link href="/sobre" aria-label="Tripper" className="self-start">
        <Logo variant="blue" className="text-[40px]" />
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-h2 font-semibold text-foreground">{title}</h1>
        <p className="text-small text-muted-foreground">Última atualização: {LEGAL_UPDATED_AT}</p>
      </header>

      <div className="text-p15 text-muted-foreground">{intro}</div>

      <div className="flex flex-col gap-8">{children}</div>

      <footer className="mt-4 flex flex-col gap-2 border-t pt-6 text-small text-muted-foreground">
        <p>
          Dúvidas? Escreva para <SupportEmail />.
        </p>
        <nav className="flex gap-4">
          <Link href="/privacidade" className="underline underline-offset-4 hover:text-foreground">Privacidade</Link>
          <Link href="/termos" className="underline underline-offset-4 hover:text-foreground">Termos de uso</Link>
          <Link href="/sobre" className="underline underline-offset-4 hover:text-foreground">Sobre o Tripper</Link>
        </nav>
      </footer>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-h5 font-medium text-foreground">{title}</h2>
      <div className="flex flex-col gap-3 text-p15 text-muted-foreground [&_li]:ml-5 [&_li]:list-disc [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_strong]:font-medium [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

export function SupportEmail() {
  return (
    <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary underline underline-offset-4">
      {SUPPORT_EMAIL}
    </a>
  );
}
