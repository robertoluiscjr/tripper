"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { safeCallback } from "@/lib/safe-redirect";
import { profileNameSchema } from "@/lib/validations";

export type SaveNameState = { error?: string; name?: string };

/** Salva o nome de quem entrou por e-mail (ou quer trocar o nome) e segue para a tela de origem. */
export async function saveName(_prev: SaveNameState, formData: FormData): Promise<SaveNameState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = profileNameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message, name: String(formData.get("name") ?? "") };
  }

  await db.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  redirect(safeCallback(formData.get("next")));
}
