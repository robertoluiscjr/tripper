import { MobileShell } from "@/components/layout/mobile-shell";
import { SplashRedirect } from "./splash-redirect";
import { Logo } from "@/components/layout/logo";

/**
 * Splash Screen (Figma 2226:2204) — início do protótipo.
 * Fundo azul + logo centralizado; depois segue para o Onboarding (1º acesso) ou Home.
 */
export default function SplashPage() {
  return (
    <MobileShell className="items-center justify-center bg-primary">
      <h1 className="sr-only">Tripper</h1>
      <Logo variant="white" />
      <SplashRedirect />
    </MobileShell>
  );
}
