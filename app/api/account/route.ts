import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { profileNameSchema } from "@/lib/validations";

/**
 * Conta do usuário (LGPD, art. 18).
 *  PATCH  → correção: troca o nome ("Editar perfil")
 *  DELETE → eliminação: cancela a assinatura no Stripe e apaga o usuário. Viagens, itens,
 *           reservas, contas de login e sessões caem junto (onDelete: Cascade no schema),
 *           então a sessão atual também deixa de valer.
 */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const parsed = profileNameSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 422 });
  }

  const updated = await db.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  return Response.json({ name: updated.name });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  // Assinatura ativa: cancela antes de apagar, para não continuar cobrando quem saiu
  if (user.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (err) {
      const code = (err as { code?: string }).code;
      // Já cancelada/inexistente no Stripe: pode seguir. Qualquer outro erro: não apaga.
      if (code !== "resource_missing") {
        return Response.json(
          { error: "Não foi possível cancelar sua assinatura agora. Tente de novo em instantes." },
          { status: 502 },
        );
      }
    }
  }

  await db.user.delete({ where: { id: user.id } });
  return new Response(null, { status: 204 });
}
