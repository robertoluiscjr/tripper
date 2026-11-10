import { Suspense } from "react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { TabBar, TabBarPlaceholder } from "@/components/layout/tab-bar";
import { getCurrentUser } from "@/lib/session";

/**
 * Área do app com tab bar (Home, Buscar, Planejar, Conta).
 * Acessível também sem login: as telas exibem a variação "pré-login" do Figma.
 * Cada página tem seu próprio <Suspense> (navegação instantânea do Next 16).
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <MobileShell>
      {children}
      <Suspense fallback={<TabBarPlaceholder />}>
        <TabBarWithUser />
      </Suspense>
    </MobileShell>
  );
}

async function TabBarWithUser() {
  const user = await getCurrentUser();
  return <TabBar userImage={user?.image} userName={user?.name} />;
}
