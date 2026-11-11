import { findDestinationPhoto } from "@/lib/destination-photos";

/**
 * Busca foto e coordenadas do destino na Wikipédia (pt) — gratuito, sem chave.
 * Usado ao criar/renomear uma viagem: a foto vira a capa do card em Planejar e
 * as coordenadas centralizam o mapa da Tela da Viagem.
 */
export type DestinationInfo = {
  coverImage: string | null;
  coverCredit: string | null;
  latitude: number | null;
  longitude: number | null;
};

const EMPTY: DestinationInfo = { coverImage: null, coverCredit: null, latitude: null, longitude: null };

type WikiPage = {
  title: string;
  index?: number;
  thumbnail?: { source: string };
  coordinates?: { lat: number; lon: number }[];
};

/**
 * Foto + coordenadas do destino. Se o destino tem foto no protótipo (Figma),
 * ela é usada como capa; a Wikipédia fornece as coordenadas (e a foto dos demais).
 */
export async function lookupDestination(query: string): Promise<DestinationInfo> {
  const wiki = await lookupWikipedia(query);
  const figmaPhoto = findDestinationPhoto(query);
  return figmaPhoto ? { ...wiki, coverImage: figmaPhoto.src, coverCredit: null } : wiki;
}

async function lookupWikipedia(query: string): Promise<DestinationInfo> {
  const q = query.trim();
  if (q.length < 2) return EMPTY;

  const url = new URL("https://pt.wikipedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: q,
    gsrlimit: "3",
    prop: "pageimages|coordinates",
    piprop: "thumbnail",
    pithumbsize: "1200",
    redirects: "1",
  }).toString();

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TripperApp/1.0 (projeto de portfolio; https://tripper.robertoluis.com.br)" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return EMPTY;
    const data = (await res.json()) as { query?: { pages?: Record<string, WikiPage> } };
    const pages = Object.values(data.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    // Prefere o primeiro resultado que tenha coordenadas (é um lugar)
    const page = pages.find((p) => p.coordinates?.length) ?? pages[0];
    if (!page) return EMPTY;

    return {
      // remove parâmetros de rastreio (?utm_...) — a URL limpa é estável e cacheável
      coverImage: page.thumbnail?.source.split("?")[0] ?? null,
      coverCredit: page.thumbnail ? `Foto: Wikipédia — ${page.title}` : null,
      latitude: page.coordinates?.[0]?.lat ?? null,
      longitude: page.coordinates?.[0]?.lon ?? null,
    };
  } catch {
    return EMPTY;
  }
}
