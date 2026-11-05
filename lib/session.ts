import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** Usuário logado (registro completo do banco) ou null. Memoizado por request. */
export const getCurrentUser = cache(async () => {
  // Marca como "request time" antes do Auth.js (que usa crypto) — exigência do Cache Components
  await connection();
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.user.findUnique({ where: { id: session.user.id } });
});

/** Igual a getCurrentUser, mas redireciona para /login se não houver sessão. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
