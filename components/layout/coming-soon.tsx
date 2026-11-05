import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Placeholder das abas cujas telas ainda serão implementadas a partir do Figma. */
export function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <main className="flex flex-1 flex-col gap-4 px-6 pt-16">
      <h1 className="text-h2 font-semibold text-foreground">{title}</h1>
      <p className="text-p15 text-muted-foreground">{text}</p>
      <Button asChild variant="outline" size="cta" className="mt-4">
        <Link href="/app">Voltar para a Home</Link>
      </Button>
    </main>
  );
}
