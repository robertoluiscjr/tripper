import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { checkUsageLimit } from "@/lib/subscription";
import { tripItemSchema } from "@/lib/validations";
import { itemDataFromInput, toTripItemDTO } from "@/lib/trip-items";

/** GET → itens do roteiro da viagem. */
export async function GET(_req: Request, ctx: RouteContext<"/api/trips/[id]/items">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const trip = await db.trip.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!trip) return Response.json({ error: "Viagem não encontrada" }, { status: 404 });

  const items = await db.tripItem.findMany({
    where: { tripId: id },
    orderBy: [{ dayNumber: "asc" }, { position: "asc" }, { createdAt: "asc" }],
  });
  return Response.json({ items: items.map(toTripItemDTO) });
}

/** POST → "Novo Item" (respeita PLAN_LIMITS.itemsPerTrip). */
export async function POST(req: Request, ctx: RouteContext<"/api/trips/[id]/items">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const trip = await db.trip.findFirst({ where: { id, userId: user.id } });
  if (!trip) return Response.json({ error: "Viagem não encontrada" }, { status: 404 });

  const parsed = tripItemSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 422 });
  }

  const usage = await checkUsageLimit(user, "itemsPerTrip", { tripId: id });
  if (!usage.allowed) {
    return Response.json(
      { error: "Você atingiu o limite de itens por viagem do plano gratuito", code: "PLAN_LIMIT", ...usage },
      { status: 402 },
    );
  }

  const result = itemDataFromInput(parsed.data, trip);
  if ("error" in result) {
    return Response.json({ error: result.error, issues: [{ path: [result.field], message: result.error }] }, { status: 422 });
  }

  const position = await db.tripItem.count({ where: { tripId: id, dayNumber: result.data.dayNumber } });
  // Pino e foto: buscados logo depois, em /items/[itemId]/place (o salvar não espera o mapa)
  const item = await db.tripItem.create({ data: { ...result.data, tripId: id, position } });
  return Response.json({ item: toTripItemDTO(item) }, { status: 201 });
}
