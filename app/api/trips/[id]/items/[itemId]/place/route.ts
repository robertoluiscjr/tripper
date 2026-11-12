import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { toTripItemDTO } from "@/lib/trip-items";
import { lookupItemPlace } from "@/lib/place-lookup";

/**
 * POST → busca o pino (mapa) e a foto real do item que ainda não tem pino.
 * Chamado pelo app logo depois de salvar (e para itens antigos, ao abrir a viagem).
 * Lugares que não existem no mapa não são achados: a busca fica em cache (lib/place-lookup.ts).
 */
export async function POST(_req: Request, ctx: RouteContext<"/api/trips/[id]/items/[itemId]/place">) {
  const { id, itemId } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const item = await db.tripItem.findFirst({
    where: { id: itemId, tripId: id, trip: { userId: user.id } },
    include: { trip: { select: { latitude: true, longitude: true } } },
  });
  if (!item) return Response.json({ error: "Item não encontrado" }, { status: 404 });
  if (item.latitude !== null) return Response.json({ item: toTripItemDTO(item) });

  const place = await lookupItemPlace(
    { category: item.category, transportMode: item.transportMode, title: item.title, address: item.address, destinationName: item.destinationName },
    item.trip,
  );
  if (place.latitude === null) return Response.json({ item: toTripItemDTO(item), found: false });
  const updated = await db.tripItem.update({ where: { id: itemId }, data: place });
  return Response.json({ item: toTripItemDTO(updated), found: true });
}
