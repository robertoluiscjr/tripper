import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/session";
import { signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { daysLeftInTrial, effectivePlan, isSubscribed } from "@/lib/subscription";
import { ContaScreen, type ContaPlan } from "@/components/conta/conta-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Conta" };

async function logout() {
  "use server";
  await signOut({ redirectTo: "/app" });
}

/** Conta — Figma "Conta (pré-login)" e "Conta (logado)". Lê a sessão dentro do <Suspense>. */
export default function ContaPage() {
  return (
    <Suspense fallback={<ContaSkeleton />}>
      <ContaContent />
    </Suspense>
  );
}

async function ContaContent() {
  const user = await getCurrentUser();
  if (!user) return <ContaScreen user={null} />;

  const tripsCount = await db.trip.count({ where: { userId: user.id } });
  return (
    <ContaScreen
      user={{ name: user.name, email: user.email, image: user.image }}
      plan={planSummary(user)}
      tripsCount={tripsCount}
      hasSubscription={isSubscribed(user)}
      logout={logout}
    />
  );
}

function planSummary(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>): ContaPlan {
  const plan = effectivePlan(user);
  if (plan === "PRO") {
    const end = user.stripeCurrentPeriodEnd?.toLocaleDateString("pt-BR");
    return { title: "Tripper PRO", detail: end ? `Renova em ${end}` : "Assinatura ativa" };
  }
  if (plan === "TRIAL") {
    const days = daysLeftInTrial(user);
    return { title: "Teste grátis", detail: `${days === 1 ? "Falta 1 dia" : `Faltam ${days} dias`}` };
  }
  return { title: "Plano gratuito", detail: "Conheça o Tripper PRO" };
}

function ContaSkeleton() {
  return (
    <main className="flex flex-1 flex-col px-6 pt-6 pb-8">
      <h1 className="text-h1 leading-[normal] font-semibold text-foreground">Conta</h1>
      <div className="mt-8 flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
      <Skeleton className="mt-8 h-7 w-32" />
      <Skeleton className="mt-4 h-[72px] w-full rounded-[12px]" />
      <Skeleton className="mt-8 h-7 w-48" />
      <Skeleton className="mt-4 h-40 w-full" />
    </main>
  );
}
