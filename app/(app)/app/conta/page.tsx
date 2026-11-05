import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Conta" };

async function logout() {
  "use server";
  await signOut({ redirectTo: "/app" });
}

// Tela de Conta ainda não desenhada no Figma — versão funcional mínima.
export default async function ContaPage() {
  const user = await getCurrentUser();

  return (
    <main className="flex flex-1 flex-col gap-4 px-6 pt-16">
      <h1 className="text-h2 font-semibold text-foreground">Conta</h1>
      {user ? (
        <>
          <p className="text-p15 text-muted-foreground">
            {user.name ?? "Viajante"} · {user.email}
          </p>
          <Button asChild variant="outline" size="cta">
            <Link href="/settings/billing">Meu plano</Link>
          </Button>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="cta" className="text-destructive">
              Sair
            </Button>
          </form>
        </>
      ) : (
        <>
          <p className="text-p15 text-muted-foreground">Entre para acessar suas viagens em qualquer dispositivo.</p>
          <Button asChild size="cta">
            <Link href="/login">Entrar</Link>
          </Button>
        </>
      )}
    </main>
  );
}
