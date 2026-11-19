import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { SUPPORT_EMAIL } from "@/lib/site";

/**
 * "Baixar meus dados" (LGPD, art. 18, II e V: acesso e portabilidade).
 * Um arquivo JSON com tudo o que o Tripper guarda sobre a pessoa: perfil, plano, forma de login,
 * viagens com os itens do roteiro e reservas. Tokens de login e IDs internos do Stripe ficam de
 * fora: são credenciais, não dados pessoais úteis para a pessoa.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const [accounts, trips, bookings] = await Promise.all([
    db.account.findMany({ where: { userId: user.id }, select: { provider: true, type: true } }),
    db.trip.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      include: { items: { orderBy: [{ dayNumber: "asc" }, { position: "asc" }] } },
    }),
    db.booking.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
  ]);

  const data = {
    geradoEm: new Date().toISOString(),
    sobre: `Cópia dos seus dados no Tripper (LGPD, art. 18). Para dúvidas ou para corrigir algo, fale com ${SUPPORT_EMAIL}.`,
    perfil: {
      nome: user.name,
      email: user.email,
      emailVerificadoEm: user.emailVerified,
      foto: user.image,
      contaCriadaEm: user.createdAt,
      apresentacaoVistaEm: user.onboardingCompletedAt,
    },
    plano: {
      plano: user.plan,
      testeTerminaEm: user.trialEndsAt,
      assinaturaRenovaEm: user.stripeCurrentPeriodEnd,
    },
    formasDeLogin: accounts.map((a) => ({ provedor: a.provider, tipo: a.type })),
    viagens: trips.map(({ userId: _userId, ...trip }) => trip),
    reservas: bookings.map(({ userId: _userId, stripeCheckoutSessionId: _checkout, ...booking }) => booking),
  };

  // Data no fuso do Brasil (o arquivo é baixado por quem está aqui)
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="tripper-meus-dados-${today}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
