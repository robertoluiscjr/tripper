import type { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { toTripDTO } from "@/lib/trips";
import { PlanejarScreen, PlanejarSkeleton } from "@/components/planejar/planejar-screen";

export const metadata: Metadata = { title: "Planejar" };

/** /app/planejar?nova=1 abre direto o bottom sheet "Nova Viagem" (card da Home). */
export default function PlanejarPage({ searchParams }: PageProps<"/app/planejar">) {
  return (
    <Suspense fallback={<PlanejarSkeleton />}>
      <PlanejarData searchParams={searchParams} />
    </Suspense>
  );
}

async function PlanejarData({ searchParams }: Pick<PageProps<"/app/planejar">, "searchParams">) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  const trips = user
    ? await db.trip.findMany({
        where: { userId: user.id },
        orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
      })
    : [];

  return (
    <PlanejarScreen
      loggedIn={!!user}
      initialTrips={trips.map(toTripDTO)}
      openNewTrip={!!user && params.nova === "1"}
    />
  );
}
