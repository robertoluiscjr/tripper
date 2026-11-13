import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DESTINATIONS, attractionsOf, getDestination } from "@/lib/catalog";
import { DestinoScreen } from "@/components/buscar/destino-screen";
import { Skeleton } from "@/components/ui/skeleton";

/** Destino Pesquisado — Figma 272:1307. Conteúdo estático: uma página por destino do catálogo. */
export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ destino: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/app/buscar/passeios/[destino]">): Promise<Metadata> {
  const d = getDestination((await params).destino);
  return { title: d ? `Passeios em ${d.name}` : "Passeios e Atrações" };
}

// O destino vem da URL: fica dentro do <Suspense> (navegação instantânea do Next 16)
export default function DestinoPage({ params }: PageProps<"/app/buscar/passeios/[destino]">) {
  return (
    <Suspense fallback={<DestinoSkeleton />}>
      <Destino params={params} />
    </Suspense>
  );
}

async function Destino({ params }: Pick<PageProps<"/app/buscar/passeios/[destino]">, "params">) {
  const d = getDestination((await params).destino);
  if (!d) notFound();
  return <DestinoScreen destination={d} attractions={attractionsOf(d.slug)} />;
}

function DestinoSkeleton() {
  return (
    <main className="flex flex-1 flex-col px-6 pt-16">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="mt-[31px] h-4 w-40" />
      <Skeleton className="mt-6 h-10 w-full" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="mt-6 flex gap-4">
          <Skeleton className="size-[102px] rounded-[12px]" />
          <div className="flex flex-1 flex-col gap-2 pt-[9px]">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </main>
  );
}
