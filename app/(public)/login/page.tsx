import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = { title: "Entrar" };

async function signInWithGoogle() {
  "use server";
  await signIn("google", { redirectTo: "/app" });
}

async function signInWithEmail(formData: FormData) {
  "use server";
  await signIn("resend", { email: formData.get("email"), redirectTo: "/app" });
}

/**
 * Login — textos em 1ª pessoa (feedback do 1º teste de usabilidade).
 * Magic link dispensa senha (resolve "recuperar senha" do 1º teste).
 */
export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-8">
      <Link href="/" aria-label="Voltar" className="text-foreground">
        <ChevronLeft className="size-6" />
      </Link>

      <div className="flex flex-col items-center gap-6 text-center">
        <Logo />
        <h1 className="text-h4 font-semibold text-foreground">
          Entre para começar a planejar sua próxima viagem
        </h1>
        <p className="text-p14 text-muted-foreground">
          Acesse usando uma de suas contas ou seu e-mail para continuar
        </p>
      </div>

      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" size="cta">
          Continuar com Google
        </Button>
      </form>

      <div className="flex items-center gap-3 text-small text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
      </div>

      <form action={signInWithEmail} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required placeholder="Digite seu melhor e-mail" className="h-12 rounded-xl" />
        </div>
        <Button type="submit" size="cta">
          Receber link de acesso
        </Button>
        <p className="text-center text-small text-muted-foreground">
          Enviaremos um link para você entrar sem precisar de senha.
        </p>
      </form>
    </main>
  );
}
