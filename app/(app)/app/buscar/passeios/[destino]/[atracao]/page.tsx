import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ATTRACTIONS, getAttraction, getDestination } from "@/lib/catalog";
import { PasseioScreen } from "@/components/buscar/passeio-screen";
import { Skeleton } from "@/components/ui/skeleton";

/** Descrição do Passeio — Figma 3806:4707. Uma página estática por atração do catálogo. */
export function generateStaticParams() {
  return ATTRACTIONS.map((a) => ({ destino: a.destination, atracao: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/app/buscar/passeios/[destino]/[atracao]">): Promise<Metadata> {
  const { destino, atracao } = await params;
  return { title: getAttraction(destino, atracao)?.name ?? "Passeio" };
}

// A atração vem da URL: fica dentro do <Suspense> (navegação instantânea do Next 16)
export default function PasseioPage({ params }: PageProps<"/app/buscar/passeios/[destino]/[atracao]">) {
  return (
    <Suspense fallback={<PasseioSkeleton />}>
      <Passeio params={params} />
    </Suspense>
  );
}

async function Passeio({ params }: Pick<PageProps<"/app/buscar/passeios/[destino]/[atracao]">, "params">) {
  const { destino, atracao } = await params;
  const d = getDestination(destino);
  const a = getAttraction(destino, atracao);
  if (!d || !a) notFound();
  return <PasseioScreen destination={d} attraction={a} />;
}

function PasseioSkeleton() {
  return (
    <main className="flex flex-1 flex-col pt-16">
      <Skeleton className="mx-6 h-6 w-6" />
      <Skeleton className="mt-6 h-64 w-full rounded-none" />
      <div className="flex flex-col gap-4 px-6 pt-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="mt-4 h-32 w-full" />
      </div>
    </main>
  );
}
