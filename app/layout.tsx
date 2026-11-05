import type { Metadata, Viewport } from "next";
import { Jost, Montserrat_Alternates } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

// Tipografia oficial do styleguide: Jost (Regular, Medium, SemiBold, Bold)
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Fonte do wordmark "tripper" (logo)
const montserratAlternates = Montserrat_Alternates({
  variable: "--font-montserrat-alt",
  subsets: ["latin", "latin-ext"], // latin-ext traz o "ı" sem pingo do wordmark
  weight: ["700"],
});

export const metadata: Metadata = {
  title: {
    default: "Tripper — Planeje sua viagem do sonho à compra",
    template: "%s · Tripper",
  },
  description:
    "Centralize o planejamento da sua viagem: roteiro personalizado, estimativa de gastos, passagens, hospedagens e passeios em um só lugar.",
  applicationName: "Tripper",
};

export const viewport: Viewport = {
  themeColor: "#2765C2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${jost.variable} ${montserratAlternates.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
