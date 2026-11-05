import { Suspense } from "react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { TabBar } from "@/components/layout/tab-bar";
import { getCurrentUser } from "@/lib/session";

/**
 * Área do app com tab bar (Home, Buscar, Planejar, Conta).
 * Acessível também sem login: as telas exibem a variação "pré-login" do Figma.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <MobileShell>
      <Suspense fallback={<div className="flex-1" />}>{children}</Suspense>
      <Suspense fallback={<TabBar />}>
        <TabBarWithUser />
      </Suspense>
    </MobileShell>
  );
}

async function TabBarWithUser() {
  const user = await getCurrentUser();
  return <TabBar userImage={user?.image} />;
}
