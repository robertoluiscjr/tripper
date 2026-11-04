import { getCurrentUser } from "@/lib/session";
import { createCustomerPortalSession } from "@/lib/stripe";

/** POST → abre o Customer Portal do Stripe (gerenciar/cancelar assinatura). */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  if (!user.stripeCustomerId) {
    return Response.json({ error: "Nenhuma assinatura encontrada" }, { status: 400 });
  }

  const session = await createCustomerPortalSession(user.stripeCustomerId);
  return Response.json({ url: session.url });
}
