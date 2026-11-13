import { Suspense } from "react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { TabBar, TabBarPlaceholder } from "@/components/layout/tab-bar";
import { getCurrentUser } from "@/lib/session";
import { Dissolve } from "@/components/layout/dissolve";

/**
 * Área do app com tab bar (Home, Buscar, Planejar, Conta).
 * Acessível também sem login: as telas exibem a variação "pré-login" do Figma.
 * Cada página tem seu próprio <Suspense> (navegação instantânea do Next 16).
 * <Dissolve>: chegar do Onboarding (ou da Splash) faz o "Dissolve" de 300ms do protótipo;
 * dentro do app o layout persiste, então trocar de aba continua instantâneo.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Dissolve>
      <MobileShell>
        {children}
        <Suspense fallback={<TabBarPlaceholder />}>
          <TabBarWithUser />
        </Suspense>
      </MobileShell>
    </Dissolve>
  );
}

async function TabBarWithUser() {
  const user = await getCurrentUser();
  return <TabBar userImage={user?.image} userName={user?.name} />;
}
