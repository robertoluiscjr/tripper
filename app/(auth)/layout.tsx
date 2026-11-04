import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { TrialBanner } from "@/components/paywall/trial-banner";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Área logada. Com Cache Components (Next 16), tudo que lê cookies/sessão
 * precisa estar dentro de <Suspense>; as páginas filhas herdam este boundary.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}

async function AuthGate({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex flex-1 flex-col">
      <TrialBanner user={user} />
      {children}
    </div>
  );
}

function AppShellSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-6">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
