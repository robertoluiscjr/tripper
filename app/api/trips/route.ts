import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { checkUsageLimit } from "@/lib/subscription";
import { createTripSchema, tripNameFrom } from "@/lib/validations";
import { resolveDestination } from "@/lib/destination";
import { daysBetween, toTripDTO } from "@/lib/trips";

/** GET → viagens do usuário (Próximas / Anteriores). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const trips = await db.trip.findMany({
    where: { userId: user.id },
    orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
  });
  return Response.json({ trips: trips.map(toTripDTO) });
}

/** POST → "Nova Viagem" (respeita PLAN_LIMITS.activeTrips). */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const parsed = createTripSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 422 });
  }

  const usage = await checkUsageLimit(user, "activeTrips");
  if (!usage.allowed) {
    return Response.json(
      { error: "Você atingiu o limite de viagens do plano gratuito", code: "PLAN_LIMIT", ...usage },
      { status: 402 },
    );
  }

  const { destination, place, durationMode, startDate, endDate, daysCount } = parsed.data;
  const byDates = durationMode === "dates" && startDate && endDate;
  // Foto e coordenadas vêm do destino (nunca do nome, que é livre: "Trip dos Brothers")
  const info = await resolveDestination({ destination, place });

  const trip = await db.trip.create({
    data: {
      userId: user.id,
      name: tripNameFrom(parsed.data),
      destination,
      ...info,
      startDate: byDates ? startDate : null,
      endDate: byDates ? endDate : null,
      daysCount: byDates ? daysBetween(startDate, endDate) : daysCount!,
    },
  });
  return Response.json({ trip: toTripDTO(trip) }, { status: 201 });
}
