import type { Metadata } from "next";
import { SearchScreen } from "@/components/buscar/search-screen";

export const metadata: Metadata = { title: "Pacotes" };

/** Busca de Pacotes (mesmo layout do Figma "Passeios e Atrações", 247:1328): abre o destino no site parceiro. */
export default function PacotesPage() {
  return <SearchScreen mode="pacotes" />;
}
