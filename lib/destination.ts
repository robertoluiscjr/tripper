import { distanceKm } from "@/lib/catalog";
import { findDestinationPhoto } from "@/lib/destination-photos";
import { PLACE_DESCRIPTION, exactDestination } from "@/lib/destination-search";
import type { DestinationPlace } from "@/lib/validations";

/**
 * Foto de capa e coordenadas do destino de uma viagem (card de Planejar e mapa da Tela da Viagem).
 *
 * Regra: só usa foto/mapa quando há certeza de que o destino é um lugar —
 *  - a pessoa escolheu uma sugestão do campo Destino (vem com coordenadas), ou
 *  - digitou exatamente o nome do 1º lugar sugerido ("Gramado").
 * Sem certeza (nome livre, apelido sem escolher a sugestão), a capa fica neutra (degradê azul)
 * em vez de uma foto errada (antes, "Floripa" virava a foto da rádio "CBN Floripa").
 */
export type DestinationInfo = {
  coverImage: string | null;
  coverCredit: string | null;
  latitude: number | null;
  longitude: number | null;
};

const EMPTY: DestinationInfo = { coverImage: null, coverCredit: null, latitude: null, longitude: null };
const UA = "TripperApp/1.0 (projeto de portfolio; https://tripper.robertoluis.com.br)";

export async function resolveDestination({ destination, place }: { destination: string; place?: DestinationPlace }): Promise<DestinationInfo> {
  const chosen = place ?? (await exactDestination(destination).catch(() => null));
  if (!chosen) return EMPTY;

  const where = { latitude: chosen.lat, longitude: chosen.lon };
  // Destinos com foto no protótipo (Figma) usam sempre a mesma imagem
  const figmaPhoto = findDestinationPhoto(chosen.name);
  if (figmaPhoto) return { ...where, coverImage: figmaPhoto.src, coverCredit: null };

  const photo = await wikipediaPhoto(chosen.wiki ?? chosen.name, chosen).catch(() => null);
  return { ...where, coverImage: photo?.src ?? null, coverCredit: photo ? `Foto: Wikipédia — ${photo.title}` : null };
}

type WikiPage = { title: string; description?: string; thumbnail?: { source: string }; coordinates?: { lat: number; lon: number }[] };

/**
 * Foto do artigo — só se o artigo for do mesmo lugar: a menos de 50 km do destino escolhido ou,
 * quando o artigo não tem coordenadas (ex.: "Paris"), se a descrição diz que é um lugar.
 */
async function wikipediaPhoto(title: string, near: { lat: number; lon: number }) {
  const url = new URL("https://pt.wikipedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    titles: title,
    prop: "pageimages|coordinates|description",
    piprop: "thumbnail",
    pithumbsize: "1200",
    redirects: "1",
  }).toString();
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(4000) });
  if (!res.ok) return null;
  const data = (await res.json()) as { query?: { pages?: Record<string, WikiPage> } };
  const page = Object.values(data.query?.pages ?? {})[0];
  if (!page?.thumbnail) return null;
  const at = page.coordinates?.[0];
  const samePlace = at ? distanceKm(at, near) <= 50 : !!page.description && PLACE_DESCRIPTION.test(page.description);
  if (!samePlace) return null;
  // remove parâmetros de rastreio (?utm_...) — a URL limpa é estável e cacheável
  return { src: page.thumbnail.source.split("?")[0], title: page.title };
}

/** Cidade de destino de um item (ex.: foto da cidade quando o terminal não tem foto). */
export async function lookupDestination(query: string): Promise<DestinationInfo> {
  return resolveDestination({ destination: query });
}
