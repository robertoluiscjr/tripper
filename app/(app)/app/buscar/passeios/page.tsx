import type { Metadata } from "next";
import { SearchScreen } from "@/components/buscar/search-screen";

export const metadata: Metadata = { title: "Passeios e Atrações" };

/** Passeios e Atrações — Figma 247:1328. */
export default function PasseiosPage() {
  return <SearchScreen mode="passeios" />;
}
