import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { checkUsageLimit } from "@/lib/subscription";
import { createTripSchema } from "@/lib/validations";

const DAY_MS = 24 * 60 * 60 * 1000;

/** GET → viagens do usuário (Próximas / Anteriores). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const trips = await db.trip.findMany({
    where: { userId: user.id },
    orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
  });
  return Response.json({ trips });
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
      { error: "Limite do plano atingido", code: "PLAN_LIMIT", ...usage },
      { status: 402 },
    );
  }

  const { name, destination, durationMode, startDate, endDate, daysCount } = parsed.data;
  const days =
    durationMode === "dates" && startDate && endDate
      ? Math.round((endDate.getTime() - startDate.getTime()) / DAY_MS) + 1
      : daysCount!;

  const trip = await db.trip.create({
    data: {
      userId: user.id,
      name,
      destination,
      startDate: durationMode === "dates" ? startDate : null,
      endDate: durationMode === "dates" ? endDate : null,
      daysCount: days,
    },
  });
  return Response.json({ trip }, { status: 201 });
}
