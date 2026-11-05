import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { TRIAL_DAYS } from "@/lib/plans";

/**
 * ⚠️ SOMENTE LOCAL — login de teste com a persona "Ana Medeiros".
 * Permite testar as telas logadas no localhost sem Google/Resend configurados.
 * Liberado em `npm run dev` e em `npm run preview` (TRIPPER_DEV_LOGIN=1).
 * Na Vercel (VERCEL=1) responde sempre 404.
 *
 * Uso: http://localhost:3000/api/dev/login  (opcional: ?next=/app/planejar)
 */
function devLoginAllowed() {
  if (process.env.VERCEL) return false;
  return process.env.NODE_ENV === "development" || process.env.TRIPPER_DEV_LOGIN === "1";
}

export async function GET(req: Request) {
  await connection(); // decide em tempo de requisição (nunca pré-renderizado no build)
  if (!devLoginAllowed()) {
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
