import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { TRIAL_DAYS } from "@/lib/plans";

/**
 * Auth.js v5 — Google OAuth + Magic Link por e-mail (Resend).
 * Variáveis lidas automaticamente: AUTH_SECRET, AUTH_GOOGLE_ID,
 * AUTH_GOOGLE_SECRET, AUTH_RESEND_KEY.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  trustHost: true,
  providers: [
    // E-mails do Google já são verificados: liga a conta Google a um cadastro feito antes por e-mail
    Google({ allowDangerousEmailAccountLinking: true }),
    Resend({
      from: process.env.EMAIL_FROM ?? "Tripper <onboarding@resend.dev>",
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verificar",
    error: "/login", // erros (link expirado etc.) voltam ao login com ?error=...
  },
  events: {
    // Primeiro login → plan=TRIAL e trialEndsAt=agora+14 dias
    async createUser({ user }) {
      if (!user.id) return;
      await db.user.update({
        where: { id: user.id },
        data: {
          plan: "TRIAL",
          trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
        },
      });
    },
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
