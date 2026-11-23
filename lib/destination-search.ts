import { cacheLife } from "next/cache";
import { DESTINATIONS, UF_NAMES, distanceKm, normalizeText, placeFromCatalog } from "@/lib/catalog";
import type { DestinationPlace } from "@/lib/validations";

/**
 * Sugestões do campo Destino da Nova Viagem: só lugares de verdade (cidades, estados, países,
 * ilhas), nunca uma rádio, um time ou uma pessoa com o mesmo nome.
 *
 * Fontes gratuitas e sem chave, consultadas pelo servidor (o aparelho da pessoa não fala com
 * elas; só o texto digitado sai daqui):
 *  1. Catálogo do app (destinos da aba Buscar, com as fotos do Figma);
 *  2. Wikipédia em português: nomes como escrevemos ("Nova York" → Nova Iorque, "Floripa" →
 *     Florianópolis) e o artigo de onde vem a foto da capa;
 *  3. OpenStreetMap (Photon, feito para busca enquanto se digita): cidades menores, com estado e país.
 * Apelidos comuns ("Sampa", "BH") são traduzidos antes da busca.
 */
const UA = "TripperApp/1.0 (projeto de portfolio; https://tripper.robertoluis.com.br)";
const LIMIT = 5;

const NICKNAMES: Record<string, string> = {
  sampa: "São Paulo",
  sp: "São Paulo",
  floripa: "Florianópolis",
  bh: "Belo Horizonte",
  beaga: "Belo Horizonte",
  poa: "Porto Alegre",
  rio: "Rio de Janeiro",
  rj: "Rio de Janeiro",
  noronha: "Fernando de Noronha",
  jampa: "João Pessoa",
  bsb: "Brasília",
  cwb: "Curitiba",
  foz: "Foz do Iguaçu",
  ny: "Nova York",
  nyc: "Nova York",
};

export async function suggestDestinations(query: string): Promise<DestinationPlace[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const official = NICKNAMES[normalizeText(q)];
  const terms = official ? [official, q] : [q];

  const results = await Promise.all(terms.flatMap((t) => [wikipedia(t).catch(() => []), photon(t).catch(() => [])]));
  const merged: DestinationPlace[] = [];
  for (const place of [...terms.flatMap(catalog), ...results.flat()]) {
    const same = merged.find((m) => isSamePlace(m, place));
    if (!same) merged.push(place);
    else if (!same.detail?.includes(",") && place.detail?.includes(",")) {
      // Mesmo lugar nas duas fontes: nome da Wikipédia, estado/país do OpenStreetMap
      same.detail = place.detail;
      same.label = place.label.replace(place.name, same.name);
    }
  }
  // Nome igual ao digitado primeiro ("Paris" → Paris, França antes de Parisi)
  // (sem apagar letras como "ø": "Florø" não é igual a "Flor")
  const plain = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const exact = new Set(terms.map(plain));
  const rank = (p: DestinationPlace) => (exact.has(plain(p.name)) ? 0 : 1);
  return merged.sort((a, b) => rank(a) - rank(b)).slice(0, LIMIT);
}

/** Texto digitado sem escolher sugestão: só vale se o 1º lugar tiver exatamente esse nome. */
export async function exactDestination(text: string): Promise<DestinationPlace | null> {
  const [first] = await suggestDestinations(text);
  if (!first) return null;
  const typed = normalizeText(text.replace(/,\s*[A-Za-z]{2}$/, ""));
  const official = NICKNAMES[typed] && normalizeText(NICKNAMES[typed]);
  const name = normalizeText(first.name);
  return name === typed || name === official || normalizeText(first.label) === normalizeText(text) ? first : null;
}

function isSamePlace(a: DestinationPlace, b: DestinationPlace) {
  if (a.wiki && a.wiki === b.wiki) return true; // mesmo artigo ("Floripa" e "Florianópolis")
  const na = normalizeText(a.name), nb = normalizeText(b.name);
  const km = distanceKm(a, b);
  if (km < 40 && (na === nb || na.includes(nb) || nb.includes(na))) return true;
  // Grafias diferentes do mesmo lugar ("Cartagena das Índias" / "Cartagena de Indias")
  const [fa] = na.split(" "), [fb] = nb.split(" ");
  return km < 25 && fa.length >= 4 && fa === fb;
}

/** Cada palavra digitada é o começo de alguma palavra do nome ("rio de" → "Rio de Janeiro"). */
function matches(name: string, q: string) {
  const words = normalizeText(name).split(" ");
  return normalizeText(q).split(" ").every((t) => words.some((w) => w.startsWith(t)));
}

// --- 1. Catálogo -------------------------------------------------------------------------------

function catalog(q: string): DestinationPlace[] {
  return DESTINATIONS.filter((d) => matches(d.name, q)).map(placeFromCatalog);
}

// --- 2. Wikipédia em português -----------------------------------------------------------------

// A descrição curta (do Wikidata) diz o que o artigo é: só fica o que começa como um lugar.
export const PLACE_DESCRIPTION =
  /^(município|cidade|capital|estado|país|ilha|ilhas|arquipélago|comuna|região|província|condado|metrópole|território|principado|balneário|praia|parque nacional|estância|cantão|península)\b/i;

type WikiPage = {
  title: string;
  index: number;
  description?: string;
  coordinates?: { lat: number; lon: number }[];
  pageprops?: { wikibase_item?: string };
};

// Cada fonte guarda o resultado por semanas; uma falha (fora do ar, lenta) não é guardada.
async function wikipedia(q: string): Promise<DestinationPlace[]> {
  "use cache";
  cacheLife("weeks");
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "prefixsearch",
    gpssearch: q,
    gpslimit: "15",
    prop: "coordinates|description|pageprops",
    ppprop: "wikibase_item",
    redirects: "1",
  });
  const data = await getJson<{ query?: { pages?: Record<string, WikiPage>; redirects?: { from: string; to: string }[] } }>(
    `https://pt.wikipedia.org/w/api.php?${params}`,
  );
  // Redirecionamentos que casam com o texto: "Floripa" → Florianópolis, "Nova York" → Nova Iorque
  const viaRedirect = new Map((data?.query?.redirects ?? []).filter((r) => matches(r.from, q)).map((r) => [r.to, r.from]));
  const pages = Object.values(data?.query?.pages ?? {})
    .filter((p) => p.coordinates?.length && p.description && PLACE_DESCRIPTION.test(p.description))
    .filter((p) => matches(p.title, q) || viaRedirect.has(p.title))
    .sort((a, b) => a.index - b.index)
    .slice(0, LIMIT);
  if (!pages.length) return [];

  // Nome como se escreve no Brasil (rótulo pt-br do Wikidata), quando houver
  const ids = pages.map((p) => p.pageprops?.wikibase_item).filter((id): id is string => !!id);
  const labels: Record<string, string> = ids.length ? await brazilianLabels(ids).catch(() => ({})) : {};

  return pages.map((p) => {
    const id = p.pageprops?.wikibase_item;
    // Achado pelo nome alternativo digitado ("Nova York" → Nova Iorque): mostra como a pessoa escreveu
    const alias = matches(p.title, q) ? undefined : viaRedirect.get(p.title);
    const name = (alias ?? ((id && labels[id]) || p.title)).replace(/\s*\([^)]*\)\s*$/, "");
    const uf = brazilianState(p.description!);
    const isState = /^estado\b/i.test(p.description!);
    return {
      name,
      label: isState ? `${name} (estado)` : uf ? `${name}, ${uf}` : name,
      detail: uf ? `${UF_NAMES[uf]}, Brasil` : p.description!.charAt(0).toUpperCase() + p.description!.slice(1),
      lat: p.coordinates![0].lat,
      lon: p.coordinates![0].lon,
      wiki: p.title,
    };
  });
}

/** "Município brasileiro do estado de Pernambuco" → "PE" (só para lugares no Brasil). */
function brazilianState(description: string) {
  if (!/brasil|munic[ií]pio/i.test(description)) return null;
  const d = normalizeText(description);
  const byLength = Object.entries(UF_NAMES).sort((a, b) => b[1].length - a[1].length);
  return byLength.find(([, n]) => d.includes(normalizeText(n)))?.[0] ?? null;
}

async function brazilianLabels(ids: string[]): Promise<Record<string, string>> {
  const params = new URLSearchParams({ action: "wbgetentities", format: "json", ids: ids.join("|"), props: "labels", languages: "pt-br|pt" });
  const data = await getJson<{ entities?: Record<string, { labels?: Record<string, { value: string }> }> }>(
    `https://www.wikidata.org/w/api.php?${params}`,
  );
  const out: Record<string, string> = {};
  for (const [id, e] of Object.entries(data?.entities ?? {})) {
    const label = e.labels?.["pt-br"]?.value ?? e.labels?.pt?.value;
    if (label) out[id] = label;
  }
  return out;
}

// --- 3. OpenStreetMap (Photon) -----------------------------------------------------------------

const PLACE_TAGS = ["city", "town", "municipality", "state", "country", "island", "archipelago"];

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: { name?: string; state?: string; country?: string; countrycode?: string; osm_value?: string };
};

async function photon(q: string): Promise<DestinationPlace[]> {
  "use cache";
  cacheLife("weeks");
  const params = new URLSearchParams({ q, limit: "10", lat: "-15.8", lon: "-47.9", location_bias_scale: "0.3" });
  for (const tag of PLACE_TAGS) params.append("osm_tag", `place:${tag}`);
  const data = await getJson<{ features?: PhotonFeature[] }>(`https://photon.komoot.io/api/?${params}`);
  const places = (data?.features ?? []).flatMap((f): DestinationPlace[] => {
    const { name, state, countrycode, osm_value } = f.properties;
    if (!name || !matches(name, q)) return []; // a busca do Photon é aproximada: "Floripa" → Florida
    const country = countryName(countrycode) ?? f.properties.country ?? "";
    const [lon, lat] = f.geometry.coordinates;
    if (osm_value === "country") return [{ name, label: name, detail: "País", lat, lon }];
    if (osm_value === "state") return [{ name, label: `${name} (estado)`, detail: `Estado, ${country}`, lat, lon }];
    const uf =
      country === "Brasil" && state ? Object.entries(UF_NAMES).find(([, n]) => normalizeText(n) === normalizeText(state))?.[0] : undefined;
    return [
      {
        name,
        label: uf ? `${name}, ${uf}` : country ? `${name}, ${country}` : name,
        detail: [state, country].filter(Boolean).join(", "),
        lat,
        lon,
      },
    ];
  });
  // Brasil primeiro (mantendo a relevância dentro de cada grupo)
  return [...places.filter((p) => p.detail?.endsWith("Brasil")), ...places.filter((p) => !p.detail?.endsWith("Brasil"))];
}

const regionNames = new Intl.DisplayNames(["pt-BR"], { type: "region" });
function countryName(code?: string) {
  try {
    return code ? regionNames.of(code.toUpperCase()) : undefined;
  } catch {
    return undefined;
  }
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`${res.status} em ${new URL(url).host}`); // erro não entra no cache
  return (await res.json()) as T;
}
