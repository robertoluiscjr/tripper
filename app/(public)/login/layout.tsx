import { MobileShell } from "@/components/layout/mobile-shell";

/** Login e "Confira seu e-mail" na moldura mobile, como as demais telas do app. */
export default function LoginLayout({ children }: LayoutProps<"/login">) {
  return <MobileShell>{children}</MobileShell>;
}
