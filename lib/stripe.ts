import Stripe from "stripe";

/**
 * Cliente Stripe com inicialização preguiçosa (Proxy): o build não quebra
 * quando STRIPE_SECRET_KEY não está configurada; o client só é criado no
 * primeiro uso em runtime. Usa a versão de API padrão do SDK instalado.
 */
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY não configurada");
  _stripe = new Stripe(key, { typescript: true, appInfo: { name: "Tripper" } });
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe();
    const value = client[prop as keyof Stripe];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Checkout de assinatura PRO. NÃO define `trial_period_days`: quem está em
 * TRIAL pode fazer upgrade e virar PRO imediatamente.
 */
export async function createCheckoutSession(params: {
  userId: string;
  email: string;
  stripeCustomerId?: string | null;
}) {
  const priceId = process.env.STRIPE_PRICE_ID_PRO;
  if (!priceId) throw new Error("STRIPE_PRICE_ID_PRO não configurada");

  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: params.stripeCustomerId ?? undefined,
    customer_email: params.stripeCustomerId ? undefined : params.email,
    client_reference_id: params.userId,
    metadata: { userId: params.userId },
    subscription_data: { metadata: { userId: params.userId } },
    allow_promotion_codes: true,
    locale: "pt-BR",
    success_url: `${appUrl()}/settings/billing?status=success`,
    cancel_url: `${appUrl()}/settings/billing?status=cancelled`,
  });
}

/** Portal do cliente Stripe para gerenciar/cancelar a assinatura. */
export async function createCustomerPortalSession(stripeCustomerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl()}/settings/billing`,
  });
}

/** Fim do período atual (no SDK atual o campo fica nos itens da assinatura). */
export function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date {
  const ends = subscription.items.data.map((item) => item.current_period_end);
  return new Date(Math.max(...ends) * 1000);
}
