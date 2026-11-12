import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { tripItemSchema } from "@/lib/validations";
import { itemDataFromInput, toTripItemDTO } from "@/lib/trip-items";
import { placeKey } from "@/lib/place-lookup";

async function findOwnItem(tripId: string, itemId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: Response.json({ error: "Não autenticado" }, { status: 401 }) } as const;
  const item = await db.tripItem.findFirst({
    where: { id: itemId, tripId, trip: { userId: user.id } },
    include: { trip: { select: { startDate: true, daysCount: true } } },
  });
  if (!item) return { error: Response.json({ error: "Item não encontrado" }, { status: 404 }) } as const;
  return { item } as const;
}

/** PATCH → editar um item do roteiro. */
export async function PATCH(req: Request, ctx: RouteContext<"/api/trips/[id]/items/[itemId]">) {
  const { id, itemId } = await ctx.params;
  const found = await findOwnItem(id, itemId);
  if ("error" in found) return found.error;

  const parsed = tripItemSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 422 });
  }
  const result = itemDataFromInput(parsed.data, found.item.trip);
  if ("error" in result) {
    return Response.json({ error: result.error, issues: [{ path: [result.field], message: result.error }] }, { status: 422 });
  }

  // Mudou o lugar: apaga pino e foto para o app buscar de novo (/items/[itemId]/place)
  const moved = placeKey({ ...found.item, ...result.data }) !== placeKey(found.item);
  const reset = moved ? { latitude: null, longitude: null, imageUrl: null } : {};
  const item = await db.tripItem.update({ where: { id: itemId }, data: { ...result.data, ...reset } });
  return Response.json({ item: toTripItemDTO(item) });
}

/** DELETE → remover um item do roteiro. */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/trips/[id]/items/[itemId]">) {
  const { id, itemId } = await ctx.params;
  const found = await findOwnItem(id, itemId);
  if ("error" in found) return found.error;
  await db.tripItem.delete({ where: { id: itemId } });
  return new Response(null, { status: 204 });
}
