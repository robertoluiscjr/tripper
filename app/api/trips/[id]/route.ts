import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createTripSchema, tripNameFrom } from "@/lib/validations";
import { resolveDestination } from "@/lib/destination";
import { daysBetween, toTripDTO } from "@/lib/trips";

async function findOwnTrip(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: Response.json({ error: "Não autenticado" }, { status: 401 }) } as const;
  const trip = await db.trip.findFirst({ where: { id, userId: user.id } });
  if (!trip) return { error: Response.json({ error: "Viagem não encontrada" }, { status: 404 }) } as const;
  return { trip } as const;
}

/** GET → uma viagem do usuário. */
export async function GET(_req: Request, ctx: RouteContext<"/api/trips/[id]">) {
  const { id } = await ctx.params;
  const found = await findOwnTrip(id);
  if ("error" in found) return found.error;
  return Response.json({ trip: toTripDTO(found.trip) });
}

/** PATCH → editar destino/nome/duração (ícone de edição da Tela da Viagem). */
export async function PATCH(req: Request, ctx: RouteContext<"/api/trips/[id]">) {
  const { id } = await ctx.params;
  const found = await findOwnTrip(id);
  if ("error" in found) return found.error;

  const parsed = createTripSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 422 });
  }

  const { destination, place, durationMode, startDate, endDate, daysCount } = parsed.data;
  const byDates = durationMode === "dates" && startDate && endDate;
  const days = byDates ? daysBetween(startDate, endDate) : daysCount!;

  // Novo destino (ou outro lugar escolhido nas sugestões) → nova foto/coordenadas
  const info = destination !== found.trip.destination || place ? await resolveDestination({ destination, place }) : {};

  const [trip] = await db.$transaction([
    db.trip.update({
      where: { id },
      data: {
        name: tripNameFrom(parsed.data),
        destination,
        ...info,
        startDate: byDates ? startDate : null,
        endDate: byDates ? endDate : null,
        daysCount: days,
      },
    }),
    // Encurtou a viagem: itens de dias que deixaram de existir vão para o último dia
    db.tripItem.updateMany({ where: { tripId: id, dayNumber: { gt: days } }, data: { dayNumber: days } }),
  ]);
  return Response.json({ trip: toTripDTO(trip) });
}

/** DELETE → excluir viagem (e seus itens, por cascata). */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/trips/[id]">) {
  const { id } = await ctx.params;
  const found = await findOwnTrip(id);
  if ("error" in found) return found.error;
  await db.trip.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
