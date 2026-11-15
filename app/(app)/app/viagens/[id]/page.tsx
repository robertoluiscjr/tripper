import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { toTripDTO } from "@/lib/trips";
import { toTripItemDTO } from "@/lib/trip-items";
import { itemCategorySchema } from "@/lib/validations";
import { TripScreen } from "@/components/viagem/trip-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Viagem" };

export default function TripPage({ params, searchParams }: PageProps<"/app/viagens/[id]">) {
  return (
    <Suspense fallback={<TripSkeleton />}>
      <TripData params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function TripData({ params, searchParams }: Pick<PageProps<"/app/viagens/[id]">, "params" | "searchParams">) {
  const { id } = await params;
  // "Adicionar itens" do Estimar Gastos: ?novo=FOOD abre o formulário daquela categoria
  // "Adicionar à viagem" da aba Buscar: ?novo=TOUR&titulo=...&endereco=... já preenche o formulário
  const query = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const openCategory = itemCategorySchema.safeParse(first(query.novo)).data;
  const title = first(query.titulo)?.slice(0, 120);
  const address = first(query.endereco)?.slice(0, 200);
  const prefill = openCategory && (title || address) ? { title, address } : undefined;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/app/viagens/${id}`);

  const trip = await db.trip.findFirst({
    where: { id, userId: user.id },
    include: { items: { orderBy: [{ dayNumber: "asc" }, { position: "asc" }, { createdAt: "asc" }] } },
  });
  if (!trip) notFound();

  return <TripScreen initialTrip={toTripDTO(trip)} initialItems={trip.items.map(toTripItemDTO)} openCategory={openCategory} prefill={prefill} />;
}

function TripSkeleton() {
  return (
    <main className="flex flex-1 flex-col pt-16">
      <div className="flex flex-col gap-2 px-6 pt-12">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="mt-2 h-[226px] w-full rounded-none" />
      <div className="flex flex-col gap-6 px-6 pt-20">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-24" />
      </div>
    </main>
  );
}
