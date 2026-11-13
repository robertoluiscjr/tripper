import attractionsData from "@/data/attractions.json";
import { flightsUrl, hotelsUrl, packagesUrl, toursUrl } from "@/lib/partners";

/**
 * Catálogo da aba Buscar: destinos do protótipo (Figma "Buscar" e "Passeios e Atrações")
 * e atrações reais de cada um. Resumo e foto das atrações vêm da Wikipédia
 * (gerados por `node scripts/catalog.mjs` em data/attractions.json).
 * Sem preços nem avaliações: isso só com dados de parceiros.
 */
export type Destination = {
  slug: string;
  name: string;
  state: string;
  /** busca nos parceiros (ex.: "Bonito, Mato Grosso do Sul") */
  query: string;
  /** aeroporto mais próximo (IATA) para a busca de passagens */
  airport: string;
  photo: string;
  photoPosition?: string;
  /** foto de fora do Figma (Wikimedia Commons): autor e licença, exibidos no app */
  photoCredit?: string;
  lat: number;
  lon: number;
};

export type Attraction = {
  destination: string;
  slug: string;
  name: string;
  subtitle: string | null;
  summary: string;
  image: string;
  wikiUrl: string;
};

const D = (d: Destination) => d;

export const DESTINATIONS: Destination[] = [
  D({ slug: "rio-de-janeiro", name: "Rio de Janeiro", state: "RJ", query: "Rio de Janeiro, Rio de Janeiro", airport: "GIG", photo: "/images/destinos/rio-de-janeiro.webp", photoPosition: "center top", lat: -22.9068, lon: -43.1729 }),
  D({ slug: "salvador", name: "Salvador", state: "BA", query: "Salvador, Bahia", airport: "SSA", photo: "/images/destinos/salvador.webp", lat: -12.9714, lon: -38.5014 }),
  D({ slug: "fortaleza", name: "Fortaleza", state: "CE", query: "Fortaleza, Ceará", airport: "FOR", photo: "/images/destinos/fortaleza.webp", lat: -3.7319, lon: -38.5267 }),
  D({ slug: "gramado", name: "Gramado", state: "RS", query: "Gramado, Rio Grande do Sul", airport: "POA", photo: "/images/destinos/gramado.webp", lat: -29.3787, lon: -50.8741 }),
  D({ slug: "florianopolis", name: "Florianópolis", state: "SC", query: "Florianópolis, Santa Catarina", airport: "FLN", photo: "/images/destinos/florianopolis.webp", lat: -27.5954, lon: -48.548 }),
  D({ slug: "lencois-maranhenses", name: "Lençóis Maranhenses", state: "MA", query: "Barreirinhas, Maranhão", airport: "SLZ", photo: "/images/destinos/lencois-maranhenses.webp", lat: -2.7569, lon: -42.8263 }),
  D({ slug: "foz-do-iguacu", name: "Foz do Iguaçu", state: "PR", query: "Foz do Iguaçu, Paraná", airport: "IGU", photo: "/images/destinos/foz-do-iguacu.webp", lat: -25.5469, lon: -54.5882 }),
  D({ slug: "manaus", name: "Manaus", state: "AM", query: "Manaus, Amazonas", airport: "MAO", photo: "/images/destinos/manaus.webp", lat: -3.119, lon: -60.0217 }),
  D({ slug: "fernando-de-noronha", name: "Fernando de Noronha", state: "PE", query: "Fernando de Noronha, Pernambuco", airport: "FEN", photo: "/images/destinos/fernando-de-noronha.webp", lat: -3.8547, lon: -32.4247 }),
  D({ slug: "bonito", name: "Bonito", state: "MS", query: "Bonito, Mato Grosso do Sul", airport: "BYO", photo: "/images/destinos/bonito.webp", lat: -21.1261, lon: -56.4836 }),
  // Fora do protótipo: fotos da Wikimedia Commons (licença pede o crédito do autor)
  D({ slug: "ouro-preto", name: "Ouro Preto", state: "MG", query: "Ouro Preto, Minas Gerais", airport: "CNF", photo: "/images/destinos/ouro-preto.webp", photoCredit: "Ouro Preto: Rosino (CC BY-SA 2.0)", lat: -20.3856, lon: -43.5035 }),
  D({ slug: "paraty", name: "Paraty", state: "RJ", query: "Paraty, Rio de Janeiro", airport: "GIG", photo: "/images/destinos/paraty.webp", photoCredit: "Paraty: Ministério da Cultura (CC BY 2.0)", lat: -23.2178, lon: -44.7131 }),
  D({ slug: "campos-do-jordao", name: "Campos do Jordão", state: "SP", query: "Campos do Jordão, São Paulo", airport: "GRU", photo: "/images/destinos/campos-do-jordao.webp", lat: -22.7394, lon: -45.5914 }),
];

// Descrição curta do Wikidata: só quando é uma frase útil (algumas vêm como "… de nível Federal, localizado (a) em …")
const usefulSubtitle = (s: string | null) => (s && s.length <= 70 && !/localizad[oa] \(a\)|página de desambiguação/i.test(s) ? s : null);

export const ATTRACTIONS: Attraction[] = (attractionsData as Attraction[]).map((a) => ({ ...a, subtitle: usefulSubtitle(a.subtitle) }));

export function getDestination(slug: string) {
  return DESTINATIONS.find((d) => d.slug === slug);
}

export function attractionsOf(destination: string) {
  return ATTRACTIONS.filter((a) => a.destination === destination);
}

export function getAttraction(destination: string, slug: string) {
  return ATTRACTIONS.find((a) => a.destination === destination && a.slug === slug);
}

/** "Rio de Janeiro", "rio  de janeiro!", "São Luís" → comparação sem acento/caixa */
export function normalizeText(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** Destinos cujo nome (ou estado) contém o texto digitado. */
export function searchDestinations(text: string) {
  const q = normalizeText(text);
  if (!q) return DESTINATIONS;
  return DESTINATIONS.filter((d) => normalizeText(`${d.name} ${d.state}`).includes(q));
}

/** Distância em km (fórmula de Haversine) — "Destinos Próximos". */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const rad = (x: number) => (x * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/* Seções da tela Buscar (Figma 214:2332): um carrossel por tipo, cada card abre o parceiro.
   Os 3 primeiros cards de cada seção são os do Figma; os demais ampliam as opções do carrossel. */
export type BuscarSection = {
  id: "pacotes" | "passagens" | "hospedagens" | "passeios";
  title: string;
  icon: string;
  kind: string;
  partner: string;
  /** "na Decolar", "no Skyscanner" */
  partnerPrep: "na" | "no";
  cards: { destination: string; photo?: string }[];
};

export const BUSCAR_SECTIONS: BuscarSection[] = [
  {
    id: "pacotes",
    title: "Viaje com esses pacotes",
    icon: "/icons/buscar/pacotes.svg",
    kind: "Pacotes",
    partner: "Decolar",
    partnerPrep: "na",
    cards: [{ destination: "rio-de-janeiro", photo: "/images/destinos/rio-copacabana.webp" }, { destination: "lencois-maranhenses" }, { destination: "foz-do-iguacu" }, { destination: "fortaleza" }, { destination: "gramado" }],
  },
  {
    id: "passagens",
    title: "Passagens aéreas",
    icon: "/icons/buscar/flight.svg",
    kind: "Passagens",
    partner: "Skyscanner",
    partnerPrep: "no",
    cards: [{ destination: "salvador" }, { destination: "florianopolis" }, { destination: "manaus" }, { destination: "fernando-de-noronha" }, { destination: "fortaleza" }],
  },
  {
    id: "hospedagens",
    title: "Hospedagens",
    icon: "/icons/buscar/bed.svg",
    kind: "Diárias",
    partner: "Booking.com",
    partnerPrep: "no",
    cards: [{ destination: "fernando-de-noronha" }, { destination: "bonito" }, { destination: "campos-do-jordao" }, { destination: "gramado" }, { destination: "salvador" }],
  },
  {
    // Não está no Figma: completa as 4 categorias do topo (os outros 3 carrosséis são do protótipo)
    id: "passeios",
    title: "Passeios e atrações",
    icon: "/icons/buscar/cat-passeios.svg",
    kind: "Passeios",
    partner: "GetYourGuide",
    partnerPrep: "no",
    cards: [{ destination: "rio-de-janeiro" }, { destination: "ouro-preto" }, { destination: "paraty" }, { destination: "manaus" }, { destination: "lencois-maranhenses" }],
  },
];

export function sectionUrl(section: BuscarSection["id"], d: Destination) {
  if (section === "passagens") return flightsUrl(d.airport);
  if (section === "hospedagens") return hotelsUrl(d.query);
  if (section === "passeios") return toursUrl(d.name);
  return packagesUrl();
}

export function attractionToursUrl(a: Attraction) {
  const d = getDestination(a.destination);
  return toursUrl(d && !a.name.includes(d.name) ? `${a.name} ${d.name}` : a.name);
}

/**
 * Miniaturas 64 × 64 das listas de destino (Figma "Passeios e Atrações", 247:1328): Rio, Salvador
 * e Florianópolis usam outras fotos do arquivo, para não repetir as da tela Buscar.
 * position = recorte do Figma (left ÷ (largura − 100%) do preenchimento da imagem).
 */
export const LIST_PHOTOS: Record<string, { src: string; position: string }> = {
  "rio-de-janeiro": { src: "/images/destinos/rio-de-janeiro-2.webp", position: "28.1% 50%" },
  salvador: { src: "/images/destinos/salvador-2.webp", position: "25.8% 50%" },
  fortaleza: { src: "/images/destinos/fortaleza.webp", position: "54% 50%" },
  gramado: { src: "/images/destinos/gramado.webp", position: "78.3% 50%" },
  florianopolis: { src: "/images/destinos/florianopolis-2.webp", position: "64.8% 50%" },
};

export function listPhoto(d: Destination) {
  return LIST_PHOTOS[d.slug] ?? { src: d.photo, position: d.photoPosition };
}

/** "Destinos mais procurados" (Figma "Passeios e Atrações"). */
export const MOST_SEARCHED = ["rio-de-janeiro", "salvador", "fortaleza", "gramado", "florianopolis"];

/* Categorias do topo da tela Buscar: a escolhida fica azul e define o campo de busca
   ("Buscar Passagens", "Buscar Passeios e Atrações"…) e a tela que ele abre. */
export type SearchMode = "passagens" | "hospedagens" | "passeios" | "pacotes";

export const SEARCH_MODES: Record<SearchMode, { label: string; icon: string; href: string; partner?: string; partnerPrep?: "na" | "no" }> = {
  passagens: { label: "Passagens", icon: "/icons/buscar/flight", href: "/app/buscar/passagens", partner: "Skyscanner", partnerPrep: "no" },
  hospedagens: { label: "Hospedagens", icon: "/icons/buscar/cat-hospedagens", href: "/app/buscar/hospedagens", partner: "Booking.com", partnerPrep: "no" },
  passeios: { label: "Passeios e Atrações", icon: "/icons/buscar/cat-passeios", href: "/app/buscar/passeios" },
  pacotes: { label: "Pacotes", icon: "/icons/buscar/cat-pacotes", href: "/app/buscar/pacotes", partner: "Decolar", partnerPrep: "na" },
};

export const SEARCH_ORDER: SearchMode[] = ["passagens", "hospedagens", "passeios", "pacotes"];

/** Destinos sugeridos na tela de busca de cada categoria (sem digitar nada). */
export function suggestedDestinations(mode: SearchMode) {
  const slugs = mode === "passeios" ? MOST_SEARCHED : (BUSCAR_SECTIONS.find((s) => s.id === mode)?.cards.map((c) => c.destination) ?? []);
  return slugs.flatMap((slug) => {
    const d = getDestination(slug);
    return d ? [d] : [];
  });
}
