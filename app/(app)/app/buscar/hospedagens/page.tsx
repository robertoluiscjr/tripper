import type { Metadata } from "next";
import { SearchScreen } from "@/components/buscar/search-screen";

export const metadata: Metadata = { title: "Hospedagens" };

/** Busca de Hospedagens (mesmo layout do Figma "Passeios e Atrações", 247:1328): abre o destino no site parceiro. */
export default function HospedagensPage() {
  return <SearchScreen mode="hospedagens" />;
}
