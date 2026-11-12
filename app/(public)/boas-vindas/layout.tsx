import { MobileShell } from "@/components/layout/mobile-shell";

export default function WelcomeLayout({ children }: LayoutProps<"/boas-vindas">) {
  return <MobileShell>{children}</MobileShell>;
}
