import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { toTripDTO } from "@/lib/trips";
import { TripScreen } from "@/components/viagem/trip-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Viagem" };

export default function TripPage({ params }: PageProps<"/app/viagens/[id]">) {
  return (
    <Suspense fallback={<TripSkeleton />}>
      <TripData params={params} />
    </Suspense>
  );
}

async function TripData({ params }: Pick<PageProps<"/app/viagens/[id]">, "params">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/app/viagens/${id}`);

  const trip = await db.trip.findFirst({ where: { id, userId: user.id } });
  if (!trip) notFound();

  return <TripScreen initialTrip={toTripDTO(trip)} />;
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
