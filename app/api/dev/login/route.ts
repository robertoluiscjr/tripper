import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { TRIAL_DAYS } from "@/lib/plans";

/**
 * ⚠️ SOMENTE DESENVOLVIMENTO — login de teste com a persona "Ana Medeiros".
 * Permite testar as telas logadas no localhost sem Google/Resend configurados.
 * Em produção (NODE_ENV=production, como na Vercel) responde 404.
 *
 * Uso: http://localhost:3000/api/dev/login  (opcional: ?next=/app/planejar)
 */
export async function GET(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const email = "ana.medeiros@tripper.test";
  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Ana Medeiros",
      image: "/images/dev/ana-medeiros.webp",
      emailVerified: new Date(),
      plan: "TRIAL",
      trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { sessionToken, userId: user.id, expires } });

  (await cookies()).set("authjs.session-token", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
  });

  const next = new URL(req.url).searchParams.get("next") ?? "/app";
  return Response.redirect(new URL(next.startsWith("/") ? next : "/app", req.url));
}
