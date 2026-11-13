import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { toTripDTO } from "@/lib/trips";
import { toTripItemDTO } from "@/lib/trip-items";
import { ProgressoScreen } from "@/components/viagem/progresso-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Ver Progresso" };

export default function ProgressoPage({ params }: PageProps<"/app/viagens/[id]/progresso">) {
  return (
    <Suspense fallback={<ProgressoSkeleton />}>
      <ProgressoData params={params} />
    </Suspense>
  );
}

async function ProgressoData({ params }: Pick<PageProps<"/app/viagens/[id]/progresso">, "params">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/app/viagens/${id}/progresso`);

  const trip = await db.trip.findFirst({
    where: { id, userId: user.id },
    include: { items: { orderBy: [{ dayNumber: "asc" }, { position: "asc" }, { createdAt: "asc" }] } },
  });
  if (!trip) notFound();

  return <ProgressoScreen initialTrip={toTripDTO(trip)} initialItems={trip.items.map(toTripItemDTO)} />;
}

function ProgressoSkeleton() {
  return (
    <main className="flex flex-1 flex-col gap-4 px-6 pt-28">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-12 w-full" />
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-[12px]" />
      ))}
    </main>
  );
}
