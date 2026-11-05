/**
 * Fotos de destinos do próprio protótipo (Figma › Components › "Imagens").
 * Têm prioridade sobre a foto da Wikipédia: o mesmo destino mostra sempre a
 * mesma imagem em todas as telas do app (coerência visual com o Figma).
 */
type DestinationPhoto = {
  src: string;
  /** recorte no card 345 × 169 (Figma: Rio alinhado ao topo) */
  position?: string;
  aliases: string[];
};

const PHOTOS: DestinationPhoto[] = [
  { src: "/images/destinos/rio-de-janeiro.webp", position: "center top", aliases: ["rio de janeiro", "rio", "rj"] },
  { src: "/images/destinos/gramado.webp", aliases: ["gramado"] },
  { src: "/images/destinos/salvador.webp", aliases: ["salvador"] },
  { src: "/images/destinos/bonito.webp", aliases: ["bonito", "bonito ms"] },
  { src: "/images/destinos/fernando-de-noronha.webp", aliases: ["fernando de noronha", "noronha"] },
  { src: "/images/destinos/foz-do-iguacu.webp", aliases: ["foz do iguacu", "foz", "cataratas do iguacu"] },
];

/** "Rio de Janeiro - RJ", "rio  de janeiro!" → "rio de janeiro" */
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s*[-–,/(].*$/, "") // remove "- RJ", ", Brasil", "(viagem)"
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findDestinationPhoto(name: string): DestinationPhoto | undefined {
  const key = normalize(name);
  return PHOTOS.find((p) => p.aliases.includes(key));
}

/** Recorte (object-position) de uma foto local conhecida. */
export function coverPosition(src: string | null | undefined): string | undefined {
  return PHOTOS.find((p) => p.src === src)?.position;
}
