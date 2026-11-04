import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { hasAccess } from "@/lib/subscription";
import { BLOCK_WHEN_TRIAL_EXPIRES } from "@/lib/plans";

/**
 * Trial expirado e sem assinatura → bloqueado → /pricing (fluxo do boilerplate).
 * Desligue BLOCK_WHEN_TRIAL_EXPIRES em lib/plans.ts para cair no plano FREE com limites.
 */
export default async function AppAreaLayout({ children }: LayoutProps<"/app">) {
  const user = await requireUser();
  if (BLOCK_WHEN_TRIAL_EXPIRES && user.plan !== "FREE" && !hasAccess(user)) {
    redirect("/pricing");
  }
  return <>{children}</>;
}
