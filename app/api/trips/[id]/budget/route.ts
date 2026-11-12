import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { updateBudgetSchema } from "@/lib/validations";
import { toTripDTO } from "@/lib/trips";

/** PATCH → "Estimar Gastos": Valor Total Planejado da viagem. */
export async function PATCH(req: Request, ctx: RouteContext<"/api/trips/[id]/budget">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const found = await db.trip.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!found) return Response.json({ error: "Viagem não encontrada" }, { status: 404 });

  const parsed = updateBudgetSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos", issues: parsed.error.issues }, { status: 422 });
  }

  const trip = await db.trip.update({ where: { id }, data: { plannedBudget: parsed.data.plannedBudget } });
  return Response.json({ trip: toTripDTO(trip) });
}
