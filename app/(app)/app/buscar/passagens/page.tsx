import type { Metadata } from "next";
import { SearchScreen } from "@/components/buscar/search-screen";

export const metadata: Metadata = { title: "Passagens" };

/** Busca de Passagens (mesmo layout do Figma "Passeios e Atrações", 247:1328): abre o destino no site parceiro. */
export default function PassagensPage() {
  return <SearchScreen mode="passagens" />;
}
