import type Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe, getSubscriptionPeriodEnd } from "@/lib/stripe";

/**
 * Webhook do Stripe — ciclo de vida da assinatura PRO.
 *  checkout.session.completed     → cria assinatura, plan=PRO
 *  invoice.payment_succeeded      → renova período
 *  customer.subscription.updated  → atualiza status/período
 *  customer.subscription.deleted  → volta para FREE
 */
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return new Response("Webhook não configurado", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "assinatura inválida";
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode !== "subscription" || !session.subscription) break;
        const userId = session.client_reference_id ?? session.metadata?.userId;
        if (!userId) break;

        const subscription = await stripe.subscriptions.retrieve(
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id,
        );
        await db.user.update({
          where: { id: userId },
          data: {
            plan: "PRO",
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: getSubscriptionPeriodEnd(subscription),
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subRef = invoice.parent?.subscription_details?.subscription;
        if (!subRef) break;
        const subscription = await stripe.subscriptions.retrieve(
          typeof subRef === "string" ? subRef : subRef.id,
        );
        await db.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan: "PRO",
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: getSubscriptionPeriodEnd(subscription),
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const active = ["active", "trialing", "past_due"].includes(subscription.status);
        await db.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            // Cancelado no fim do período continua "active" até lá
            plan: active ? "PRO" : "FREE",
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: getSubscriptionPeriodEnd(subscription),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await db.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { plan: "FREE", stripeSubscriptionId: null, stripePriceId: null },
        });
        break;
      }
    }
  } catch (err) {
    console.error("[stripe-webhook]", event.type, err);
    return new Response("Erro ao processar webhook", { status: 500 });
  }

  return Response.json({ received: true });
}
