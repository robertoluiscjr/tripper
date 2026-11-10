import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { safeCallback } from "@/lib/safe-redirect";
import { Logo } from "@/components/layout/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { NameForm } from "./name-form";

export const metadata: Metadata = { title: "Bem-vindo(a)" };

/**
 * Depois do login por e-mail: o link não traz o nome da pessoa (o Google traz),
 * então perguntamos como ela quer ser chamada. Quem já tem nome segue direto.
 * Também usada na Conta para trocar o nome (?editar=1).
 */
export default function WelcomePage({ searchParams }: PageProps<"/boas-vindas">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-10">
      <Logo variant="blue" className="self-center text-[40px]" />
      <Suspense fallback={<WelcomeSkeleton />}>
        <WelcomeContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function WelcomeContent({ searchParams }: Pick<PageProps<"/boas-vindas">, "searchParams">) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  const next = safeCallback(params.next);
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(next)}`);

  const editing = params.editar === "1";
  if (user.name && !editing) redirect(next);

  return (
    <>
      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-h4 font-semibold text-foreground">
          {editing ? "Alterar nome" : "Seja bem-vindo(a) ao Tripper!"}
        </h1>
        <p className="text-p15 text-muted-foreground">
          {editing
            ? "Esse é o nome que aparece na saudação e na sua conta."
            : "Como podemos te chamar? Assim a saudação do app fica com a sua cara."}
        </p>
      </div>
      <NameForm defaultName={user.name ?? ""} next={next} editing={editing} />
    </>
  );
}

function WelcomeSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="mx-auto h-8 w-3/4" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-14 w-full rounded-full" />
    </div>
  );
}
