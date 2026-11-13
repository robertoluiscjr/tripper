import type { Metadata } from "next";
import { BuscarScreen } from "@/components/buscar/buscar-screen";

export const metadata: Metadata = { title: "Buscar" };

/** Buscar — Figma 214:2332 (conteúdo estático: aparece na hora, com ou sem login). */
export default function BuscarPage() {
  return <BuscarScreen />;
}
