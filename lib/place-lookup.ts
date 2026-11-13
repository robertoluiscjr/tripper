import type { ItemCategory, TransportMode } from "@prisma/client";
import { cacheLife } from "next/cache";
import { lookupDestination } from "@/lib/destination";

/**
 * Localização e foto real de um item do roteiro, para o pino no mapa e a foto do "Small Card".
 *
 * - Lugar: OpenStreetMap (Nominatim) — gratuito, sem chave; limite de 1 busca por segundo.
 *   Transporte → o destino (voo: o aeroporto da cidade de destino). Demais → nome/endereço,
 *   procurado perto do destino da viagem.
 * - Foto: o artigo da Wikipédia / item do Wikidata ligado ao lugar no OpenStreetMap.
 *   Transporte sem foto do terminal → foto da cidade de destino. Hospedagem e demais sem foto
 *   pública → null (o app mostra a foto/ícone padrão).
 */
export type PlaceInfo = { latitude: number | null; longitude: number | null; imageUrl: string | null };

type ItemPlaceInput = {
  category: ItemCategory;
  transportMode?: TransportMode | null;
  title: string;
  address?: string | null;
  destinationName?: string | null;
};
type TripPlaceInput = { latitude: number | null; longitude: number | null };

const EMPTY: PlaceInfo = { latitude: null, longitude: null, imageUrl: null };
const UA = "TripperApp/1.0 (projeto de portfolio; https://tripper.robertoluis.com.br)";
const THUMB = 320; // a foto aparece com 64px (até 3× em telas densas)

/** Campos que mudam o lugar do item (no PATCH, só busca de novo se algum mudou). */
export function placeKey(item: ItemPlaceInput) {
  return [item.category, item.transportMode ?? "", item.title, item.address ?? "", item.destinationName ?? ""].join("|");
}

export async function lookupItemPlace(item: ItemPlaceInput, trip: TripPlaceInput): Promise<PlaceInfo> {
  // Mesma busca = mesmo resultado (inclusive "não achou"): poupa o OpenStreetMap e deixa rápido
  "use cache";
  cacheLife("weeks");
  try {
    if (item.category === "TRANSPORT") return await lookupTransport(item, trip);
    return await lookupLocal(item, trip);
  } catch {
    return EMPTY;
  }
}

/** Voo → aeroporto de destino; ônibus → rodoviária; trem → estação; navio → porto. */
async function lookupTransport(item: ItemPlaceInput, trip: TripPlaceInput): Promise<PlaceInfo> {
  const dest = item.destinationName?.trim();
  if (!dest) return EMPTY;
  const city = dest.replace(/\s*\([^)]*\)\s*/g, " ").trim(); // "Porto Seguro (BPS)" → "Porto Seguro"
  const code = dest.match(/\(([A-Za-z]{3})\)/)?.[1]?.toUpperCase();
  const mode = item.transportMode ?? "PLANE";

  const [prefix, wanted] = TERMINAL[mode];
  // Código IATA ("BPS") é o mais preciso; depois "aeroporto de Porto Seguro" etc.
  const queries = [
    mode === "PLANE" && code ? `${code} airport` : null,
    prefix ? `${prefix} de ${city}` : null,
    prefix ? `${prefix} ${city}` : null,
    dest,
  ];
  const place = await firstPlace(queries, { trip, prefer: wanted });
  if (!place) return EMPTY;

  // Foto: o terminal (Wikipédia) ou, se não houver, a cidade de destino
  const photo = (await placePhoto(place)) ?? (await lookupDestination(city)).coverImage;
  return { latitude: Number(place.lat), longitude: Number(place.lon), imageUrl: photo };
}

const TERMINAL: Record<TransportMode, [prefix: string | null, wanted: string | null]> = {
  PLANE: ["aeroporto", "aerodrome"],
  BUS: ["rodoviária", "bus_station"],
  TRAIN: ["estação", "station"],
  SHIP: ["porto", null],
  OWN_CAR: [null, null],
};

/** Hospedagem, passeios, restaurantes, aluguel de carro e atividades: perto do destino da viagem. */
async function lookupLocal(item: ItemPlaceInput, trip: TripPlaceInput): Promise<PlaceInfo> {
  const title = item.title.trim();
  const named = title && !GENERIC_TITLES.has(title.toLowerCase()) ? title : null;
  const address = item.address?.trim() || null;
  const queries = [named && address ? `${named}, ${address}` : null, named, address];
  const place = await firstPlace(queries, { trip, bounded: true });
  if (!place) return EMPTY;
  return { latitude: Number(place.lat), longitude: Number(place.lon), imageUrl: await placePhoto(place) };
}

const GENERIC_TITLES = new Set(["acomodação", "aluguel de carro", "passeio", "atividade"]);

// --- OpenStreetMap (Nominatim) ------------------------------------------------------------------

type NominatimPlace = {
  lat: string;
  lon: string;
  type: string;
  name?: string;
  extratags?: Record<string, string> | null;
};

async function firstPlace(
  queries: (string | null)[],
  { trip, prefer, bounded = false }: { trip: TripPlaceInput; prefer?: string | null; bounded?: boolean },
): Promise<NominatimPlace | null> {
  const seen = new Set<string>();
  let fallback: NominatimPlace | null = null; // sem o tipo preferido (ex.: aeroporto), fica o 1º lugar achado
  for (const q of queries) {
    if (!q || q.length < 3 || seen.has(q.toLowerCase())) continue;
    seen.add(q.toLowerCase());
    const results = await nominatim(q, trip, bounded).catch(() => []); // lento/fora do ar: tenta a próxima
    if (!prefer && results[0]) return results[0];
    const hit = results.find((r) => r.type === prefer);
    if (hit) return hit;
    fallback ??= results[0] ?? null;
  }
  return fallback;
}

// Política do Nominatim: no máximo 1 requisição por segundo (por instância do servidor)
let lastCall = 0;
async function throttle() {
  const wait = lastCall + 1100 - Date.now();
  lastCall = Math.max(Date.now(), lastCall + 1100);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
}

async function nominatim(q: string, trip: TripPlaceInput, bounded: boolean): Promise<NominatimPlace[]> {
  const params = new URLSearchParams({ q, format: "jsonv2", limit: "5", extratags: "1", "accept-language": "pt-BR" });
  if (trip.latitude !== null && trip.longitude !== null) {
    // Prefere (ou, para lugares locais, exige) resultados a ~70 km do destino da viagem
    const d = 0.6;
    params.set("viewbox", [trip.longitude - d, trip.latitude + d, trip.longitude + d, trip.latitude - d].join(","));
    if (bounded) params.set("bounded", "1");
  }
  await throttle();
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return [];
  return (await res.json()) as NominatimPlace[];
}

// --- Fotos (Wikipédia / Wikidata / Wikimedia Commons) --------------------------------------------

async function placePhoto(place: NominatimPlace): Promise<string | null> {
  const tags = place.extratags ?? {};
  if (tags.wikipedia) {
    const [lang, ...rest] = tags.wikipedia.split(":");
    const photo = await wikipediaThumb(rest.length ? lang : "pt", rest.length ? rest.join(":") : tags.wikipedia);
    if (photo) return photo;
  }
  if (tags.wikidata) {
    const file = await wikidataImage(tags.wikidata);
    if (file) return commonsThumb(file);
  }
  const commons = tags.wikimedia_commons ?? tags.image;
  if (commons?.startsWith("File:")) return commonsThumb(commons.slice(5));
  return null;
}

async function getJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(4000) });
  return res.ok ? ((await res.json()) as T) : null;
}

async function wikipediaThumb(lang: string, title: string): Promise<string | null> {
  if (!/^[a-z-]{2,12}$/.test(lang)) return null;
  const params = new URLSearchParams({ action: "query", format: "json", titles: title, prop: "pageimages", piprop: "thumbnail", pithumbsize: String(THUMB), redirects: "1" });
  const data = await getJson<{ query?: { pages?: Record<string, { thumbnail?: { source: string } }> } }>(
    `https://${lang}.wikipedia.org/w/api.php?${params}`,
  );
  const page = Object.values(data?.query?.pages ?? {})[0];
  return cleanUrl(page?.thumbnail?.source);
}

async function wikidataImage(id: string): Promise<string | null> {
  if (!/^Q\d+$/.test(id)) return null;
  const params = new URLSearchParams({ action: "wbgetclaims", format: "json", entity: id, property: "P18" });
  const data = await getJson<{ claims?: { P18?: { mainsnak?: { datavalue?: { value?: string } } }[] } }>(
    `https://www.wikidata.org/w/api.php?${params}`,
  );
  return data?.claims?.P18?.[0]?.mainsnak?.datavalue?.value ?? null;
}

async function commonsThumb(file: string): Promise<string | null> {
  const params = new URLSearchParams({ action: "query", format: "json", titles: `File:${file}`, prop: "imageinfo", iiprop: "url", iiurlwidth: String(THUMB) });
  const data = await getJson<{ query?: { pages?: Record<string, { imageinfo?: { thumburl?: string }[] }> } }>(
    `https://commons.wikimedia.org/w/api.php?${params}`,
  );
  return cleanUrl(Object.values(data?.query?.pages ?? {})[0]?.imageinfo?.[0]?.thumburl);
}

/** Remove parâmetros de rastreio (?utm_...): a URL limpa é estável e cacheável. */
const cleanUrl = (url: string | undefined) => url?.split("?")[0] ?? null;
