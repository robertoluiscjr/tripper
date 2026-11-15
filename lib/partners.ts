/**
 * Links para os sites parceiros (aba Buscar). Sem compra dentro do app: a pessoa pesquisa no
 * Tripper e reserva no parceiro.
 *
 * Monetização futura: ao entrar num programa de afiliados, basta acrescentar o código de
 * afiliado aqui (ex.: `aid` da Booking, `partner_id` da GetYourGuide) — as telas não mudam.
 */
export type Partner = "booking" | "getyourguide" | "skyscanner" | "decolar";

export const PARTNER_NAME: Record<Partner, string> = {
  booking: "Booking.com",
  getyourguide: "GetYourGuide",
  skyscanner: "Skyscanner",
  decolar: "Decolar",
};

/** Hospedagens no destino (Booking.com). */
export function hotelsUrl(query: string) {
  return `https://www.booking.com/searchresults.pt-br.html?${new URLSearchParams({ ss: query })}`;
}

/** Passeios e ingressos de uma atração ou cidade (GetYourGuide). */
export function toursUrl(query: string) {
  return `https://www.getyourguide.com/pt-br/s/?${new URLSearchParams({ q: query })}`;
}

/** Passagens aéreas de qualquer cidade do Brasil para o aeroporto do destino (Skyscanner). */
export function flightsUrl(airport: string) {
  return `https://www.skyscanner.com.br/transporte/passagens-aereas/br/${airport.toLowerCase()}/`;
}

/** Pacotes (voo + hotel) — a Decolar não tem busca por destino na URL: abre a página de pacotes. */
export function packagesUrl() {
  return "https://www.decolar.com/pacotes/";
}
