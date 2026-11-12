import { MobileShell } from "@/components/layout/mobile-shell";
import { SplashRedirect } from "./splash-redirect";
import { Logo } from "@/components/layout/logo";
import { Dissolve } from "@/components/layout/dissolve";

/**
 * Splash Screen (Figma 2226:2204) — início do protótipo.
 * Fundo azul + logo centralizado; depois segue para o Onboarding (1º acesso) ou Home,
 * com o "Dissolve" de 300ms do protótipo.
 */
export default function SplashPage() {
  return (
    <Dissolve>
      <MobileShell className="items-center justify-center bg-primary">
        <h1 className="sr-only">Tripper</h1>
        <Logo variant="white" />
        <SplashRedirect />
      </MobileShell>
    </Dissolve>
  );
}
