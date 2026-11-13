import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { moveTripItemSchema } from "@/lib/validations";
import { moveDays, toTripItemDTO } from "@/lib/trip-items";

const DAY = 86_400_000;

/**
 * POST → arrastar e soltar um item do roteiro (ícone "Drag Indicator").
 * Muda o dia do item (e a data/hora junto, em viagens com datas) e grava a nova ordem do dia.
 */
export async function POST(req: Request, ctx: RouteContext<"/api/trips/[id]/items/reorder">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const parsed = moveTripItemSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 422 });
  const { itemId, kind, toDay, order } = parsed.data;

  const trip = await db.trip.findFirst({
    where: { id, userId: user.id },
    select: { startDate: true, daysCount: true, items: { select: { id: true } } },
  });
  if (!trip) return Response.json({ error: "Viagem não encontrada" }, { status: 404 });
  const item = await db.tripItem.findFirst({ where: { id: itemId, tripId: id } });
  if (!item) return Response.json({ error: "Item não encontrado" }, { status: 404 });

  const days = moveDays(item, kind, toDay, trip.daysCount);
  if ("error" in days) return Response.json({ error: days.error }, { status: 422 });

  // Viagem com datas: a data acompanha o dia (o horário continua o mesmo)
  const shift = (d: Date | null, delta: number) => (d && trip.startDate && delta ? new Date(d.getTime() + delta * DAY) : d);
  const own = new Set(trip.items.map((i) => i.id));
  const ids = order.filter((i) => own.has(i));

  await db.$transaction([
    db.tripItem.update({
      where: { id: itemId },
      data: {
        dayNumber: days.dayNumber,
        endDayNumber: days.endDayNumber,
        startAt: shift(item.startAt, days.startDelta),
        endAt: shift(item.endAt, days.endDelta),
      },
    }),
    ...ids.map((itemId, position) => db.tripItem.update({ where: { id: itemId }, data: { position } })),
  ]);

  const items = await db.tripItem.findMany({
    where: { tripId: id },
    orderBy: [{ dayNumber: "asc" }, { position: "asc" }, { createdAt: "asc" }],
  });
  return Response.json({ items: items.map(toTripItemDTO) });
}
