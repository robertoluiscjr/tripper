import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { progressPlanSchema } from "@/lib/validations";
import { toTripDTO } from "@/lib/trips";

/** PATCH → "Ver Progresso": categorias que a viagem vai ter e quantos itens em cada. */
export async function PATCH(req: Request, ctx: RouteContext<"/api/trips/[id]/progress">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const found = await db.trip.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!found) return Response.json({ error: "Viagem não encontrada" }, { status: 404 });

  const parsed = progressPlanSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos", issues: parsed.error.issues }, { status: 422 });
  }

  const trip = await db.trip.update({ where: { id }, data: { progressPlan: parsed.data.plan } });
  return Response.json({ trip: toTripDTO(trip) });
}
