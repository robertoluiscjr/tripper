import type { Metadata } from "next";
import { PasseiosScreen } from "@/components/buscar/passeios-screen";

export const metadata: Metadata = { title: "Passeios e Atrações" };

/** Passeios e Atrações — Figma 247:1328. */
export default function PasseiosPage() {
  return <PasseiosScreen />;
}
