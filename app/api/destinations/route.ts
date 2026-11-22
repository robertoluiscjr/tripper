import { suggestDestinations } from "@/lib/destination-search";

/**
 * GET /api/destinations?q=flor → sugestões do campo Destino da Nova Viagem.
 * Aberta também sem login: a Nova Viagem pode ser preenchida antes de entrar (rascunho).
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 60) return Response.json({ places: [] });
  const places = await suggestDestinations(q);
  return Response.json({ places }, { headers: { "Cache-Control": "private, max-age=3600" } });
}
