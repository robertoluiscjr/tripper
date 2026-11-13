/**
 * Gera data/attractions.json (aba Buscar) a partir da Wikipédia em português:
 * resumo, foto e link de cada atração listada em scripts/catalog-titles.json.
 * Rodar de novo quando mudar a lista: node scripts/catalog.mjs
 * Textos: CC BY-SA 4.0 (crédito "Wikipédia" exibido no app). Fotos: Wikimedia Commons.
 */
import fs from "node:fs";

const UA = { "User-Agent": "TripperApp/1.0 (projeto de portfolio; https://tripper.robertoluis.com.br)" };
const lists = JSON.parse(fs.readFileSync(new URL("./catalog-titles.json", import.meta.url), "utf8"));
const slugify = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const entries = Object.entries(lists).flatMap(([destination, items]) =>
  items.map((it) => {
    const [name, wiki] = Array.isArray(it) ? it : [it, it];
    return { destination, name, wiki };
  }),
);

const pages = new Map();
for (let i = 0; i < entries.length; i += 20) {
  const batch = entries.slice(i, i + 20);
  const url = new URL("https://pt.wikipedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query", format: "json", formatversion: "2", redirects: "1",
    titles: batch.map((e) => e.wiki).join("|"),
    prop: "extracts|pageimages|description|info", exintro: "1", explaintext: "1", exlimit: "max",
    piprop: "thumbnail", pithumbsize: "1200", inprop: "url",
  }).toString();
  const j = await (await fetch(url, { headers: UA })).json();
  const alias = new Map();
  for (const r of [...(j.query.normalized ?? []), ...(j.query.redirects ?? [])]) alias.set(r.from, r.to);
  const resolve = (t) => { let x = t; for (let k = 0; k < 3 && alias.has(x); k++) x = alias.get(x); return x; };
  for (const e of batch) {
    const p = j.query.pages.find((p) => p.title === resolve(e.wiki));
    if (p && !p.missing) pages.set(e, p);
  }
}

const clean = (t = "") => t.replace(/\s*\([^()]*(?:pronúncia|IPA|AFI)[^()]*\)/g, "").replace(/\n{2,}/g, "\n\n").trim();
const out = [];
for (const e of entries) {
  const p = pages.get(e);
  if (!p?.thumbnail || !p.extract) { console.warn("sem página/foto/resumo:", e.wiki); continue; }
  out.push({
    destination: e.destination,
    slug: slugify(e.name),
    name: e.name,
    subtitle: p.description ? p.description[0].toUpperCase() + p.description.slice(1) : null,
    summary: clean(p.extract),
    // sem ?utm_... (a URL limpa é estável e passa no remotePatterns do next/image)
    image: p.thumbnail.source.split("?")[0],
    wikiUrl: p.fullurl,
  });
}
fs.mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
fs.writeFileSync(new URL("../data/attractions.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "atrações");
