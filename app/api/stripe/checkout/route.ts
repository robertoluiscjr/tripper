import { getCurrentUser } from "@/lib/session";
import { createCheckoutSession } from "@/lib/stripe";

/** POST → cria Checkout Session do plano PRO e devolve a URL. */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const session = await createCheckoutSession({
    userId: user.id,
    email: user.email,
    stripeCustomerId: user.stripeCustomerId,
  });
  return Response.json({ url: session.url });
}
