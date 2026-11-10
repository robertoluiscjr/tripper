import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { signIn } from "@/lib/auth";
import { safeCallback } from "@/lib/safe-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = { title: "Entrar" };

// Provedores ativos de acordo com as chaves configuradas (.env / Vercel)
const GOOGLE_ENABLED = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
const EMAIL_ENABLED = !!process.env.AUTH_RESEND_KEY;

async function signInWithGoogle(formData: FormData) {
  "use server";
  await signIn("google", { redirectTo: safeCallback(formData.get("callbackUrl")) });
}

async function signInWithEmail(formData: FormData) {
  "use server";
  // Quem entra por e-mail não traz nome: passa por /boas-vindas (pergunta o nome só se faltar)
  const next = safeCallback(formData.get("callbackUrl"));
  await signIn("resend", {
    email: formData.get("email"),
    redirectTo: `/boas-vindas?next=${encodeURIComponent(next)}`,
  });
}

const ERRORS: Record<string, string> = {
  OAuthAccountNotLinked: "Este e-mail já está ligado a outra forma de acesso. Entre como da primeira vez.",
  Verification: "O link de acesso expirou ou já foi usado. Peça um novo abaixo.",
  AccessDenied: "Acesso negado. Tente novamente.",
  EmailSignin: "Não conseguimos enviar o e-mail agora. Confira o endereço e tente novamente.",
  Configuration: "O login está temporariamente indisponível. Tente novamente em instantes.",
};

/**
 * Login — textos em 1ª pessoa (feedback do 1º teste de usabilidade).
 * Magic link dispensa senha (resolve "recuperar senha" do 1º teste).
 * Volta para a tela de origem (?callbackUrl=/app/planejar) após entrar.
 */
export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-8">
      <Link href="/app" aria-label="Voltar" className="text-foreground">
        <ChevronLeft className="size-6" />
      </Link>

      <div className="flex flex-col items-center gap-6 text-center">
        <Logo variant="blue" className="text-[40px]" />
        <h1 className="text-h4 font-semibold text-foreground">
          Entre para começar a planejar sua próxima viagem
        </h1>
        <p className="text-p14 text-muted-foreground">
          Acesse usando uma de suas contas ou seu e-mail para continuar
        </p>
      </div>

      <Suspense fallback={<LoginForms callbackUrl="/app" />}>
        <LoginFormsWithParams searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function LoginFormsWithParams({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  return <LoginForms callbackUrl={safeCallback(params.callbackUrl)} error={error ? (ERRORS[error] ?? ERRORS.Configuration) : undefined} />;
}

function LoginForms({ callbackUrl, error }: { callbackUrl: string; error?: string }) {
  if (!GOOGLE_ENABLED && !EMAIL_ENABLED) {
    return (
      <p className="rounded-xl bg-muted p-4 text-center text-p14 text-muted-foreground">
        O login ainda está sendo configurado. Volte em breve!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-center text-p14 text-destructive">
          {error}
        </p>
      )}

      {GOOGLE_ENABLED && (
        <form action={signInWithGoogle}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <Button type="submit" variant="outline" size="cta">
            <GoogleIcon />
            Continuar com Google
          </Button>
        </form>
      )}

      {GOOGLE_ENABLED && EMAIL_ENABLED && (
        <div className="flex items-center gap-3 text-small text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
        </div>
      )}

      {EMAIL_ENABLED && (
        <form action={signInWithEmail} className="flex flex-col gap-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="Digite seu melhor e-mail" className="h-12 rounded-xl" />
          </div>
          <Button type="submit" size="cta">
            Receber link de acesso
          </Button>
          <p className="text-center text-small text-muted-foreground">
            Enviaremos um link para você entrar sem precisar de senha.
          </p>
        </form>
      )}

      <p className="text-center text-small text-muted-foreground">
        Ao continuar, você concorda com os{" "}
        <Link href="/termos" className="underline underline-offset-4 hover:text-foreground">Termos de uso</Link> e a{" "}
        <Link href="/privacidade" className="underline underline-offset-4 hover:text-foreground">Política de Privacidade</Link>.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}
