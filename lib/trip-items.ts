import type { ItemCategory, TransportMode, TripItem } from "@prisma/client";

/**
 * Itens do roteiro (Figma "Novo Item" 3484:3490 · Voo 195:532 · Acomodação 195:828).
 *
 * Convenções de data/hora:
 * - O dia do item fica em `dayNumber` (e `endDayNumber` para check-out, devolução ou chegada).
 * - `startAt`/`endAt` só existem quando a pessoa informou o horário. Guardam a hora "de parede"
 *   em UTC (sem fuso): 08:00 digitado = 08:00Z. Em viagens com datas, a data também é a real;
 *   em viagens só com quantidade de dias, a data é 1970-01-01 (só a hora importa).
 */
export type TripItemDTO = {
  id: string;
  category: ItemCategory;
  title: string;
  dayNumber: number;
  endDayNumber: number | null;
  position: number;
  startAt: string | null;
  endAt: string | null;
  cost: string | null;
  notes: string | null;
  address: string | null;
  transportMode: TransportMode | null;
  carrier: string | null;
  code: string | null;
  originName: string | null;
  destinationName: string | null;
  /** Pino no mapa (lib/place-lookup.ts) */
  latitude: number | null;
  longitude: number | null;
  /** Foto real do lugar (Wikipédia/Wikimedia), quando encontrada */
  imageUrl: string | null;
};

export function toTripItemDTO(item: TripItem): TripItemDTO {
  return {
    id: item.id,
    category: item.category,
    title: item.title,
    dayNumber: item.dayNumber,
    endDayNumber: item.endDayNumber,
    position: item.position,
    startAt: item.startAt?.toISOString() ?? null,
    endAt: item.endAt?.toISOString() ?? null,
    cost: item.cost?.toString() ?? null,
    notes: item.notes,
    address: item.address,
    transportMode: item.transportMode,
    carrier: item.carrier,
    code: item.code,
    originName: item.originName,
    destinationName: item.destinationName,
    latitude: item.latitude,
    longitude: item.longitude,
    imageUrl: item.imageUrl,
  };
}

/** Ordem e textos do menu "Novo Item". */
export const CATEGORY_MENU: { category: ItemCategory; label: string; icon: string }[] = [
  { category: "TRANSPORT", label: "Transportes", icon: "/icons/itens/transport.svg" },
  { category: "ACCOMMODATION", label: "Acomodações", icon: "/icons/itens/accommodation.svg" },
  { category: "TOUR", label: "Passeios e Atrações", icon: "/icons/itens/tour.svg" },
  { category: "FOOD", label: "Comer e Beber", icon: "/icons/itens/food.svg" },
  { category: "CAR_RENTAL", label: "Aluguel de Carro", icon: "/icons/itens/car-rental.svg" },
  { category: "CUSTOM", label: "Atividades Personalizadas", icon: "/icons/itens/custom.svg" },
];

/** Lista do dropdown "Tipos de Transporte" (Figma Transportes 2 · 2062:1662). */
export const TRANSPORT_MODES: { mode: TransportMode; label: string; icon: string }[] = [
  { mode: "PLANE", label: "Avião", icon: "/icons/itens/mode-plane.svg" },
  { mode: "BUS", label: "Ônibus", icon: "/icons/itens/mode-bus.svg" },
  { mode: "TRAIN", label: "Trem", icon: "/icons/itens/mode-train.svg" },
  { mode: "SHIP", label: "Navio", icon: "/icons/itens/mode-ship.svg" },
  { mode: "OWN_CAR", label: "Carro próprio", icon: "/icons/itens/mode-own-car.svg" },
];

/** Ícone branco do círculo escuro da linha do tempo. */
export function itemBadgeIcon(item: Pick<TripItemDTO, "category" | "transportMode">) {
  if (item.category === "TRANSPORT") {
    const mode = item.transportMode ?? "PLANE";
    return mode === "PLANE" ? "/icons/itens/plane-white.svg" : `/icons/itens/white/mode-${slug(mode)}.svg`;
  }
  if (item.category === "ACCOMMODATION") return "/icons/itens/bed-white.svg";
  return `/icons/itens/white/${slug(item.category)}.svg`;
}

/** Ícone (branco, 15px) dentro do pino do mapa — Figma "Location (W200)" + set "Ícones". */
export function itemPinIcon(item: Pick<TripItemDTO, "category" | "transportMode">) {
  const name =
    item.category === "TRANSPORT"
      ? ({ PLANE: "plane", BUS: "bus", TRAIN: "train", SHIP: "ship", OWN_CAR: "car" } as const)[item.transportMode ?? "PLANE"]
      : ({ TRANSPORT: "plane", ACCOMMODATION: "bed", TOUR: "tour", FOOD: "food", CAR_RENTAL: "car", CUSTOM: "custom" } as const)[item.category];
  return `/icons/itens/pin/${name}.svg`;
}

/**
 * Foto do "Small Card": a foto real do lugar (aeroporto de destino, atração, hospedagem…) quando
 * encontrada. Hospedagem sem foto pública usa a foto da cidade de destino (capa da viagem).
 * Sem nada disso: as do protótipo para voo e hospedagem; demais itens usam o ícone.
 */
export function itemPhoto(item: Pick<TripItemDTO, "category" | "transportMode" | "imageUrl">, cityPhoto?: string | null): string | null {
  if (item.imageUrl) return item.imageUrl;
  if (item.category === "ACCOMMODATION") return cityPhoto || "/images/itens/hotel.webp";
  if (item.category === "TRANSPORT" && (item.transportMode ?? "PLANE") === "PLANE") return "/images/itens/aeroporto.webp";
  return null;
}

export function itemCardIcon(item: Pick<TripItemDTO, "category" | "transportMode">) {
  if (item.category === "TRANSPORT") return TRANSPORT_MODES.find((m) => m.mode === (item.transportMode ?? "PLANE"))!.icon;
  return CATEGORY_MENU.find((c) => c.category === item.category)!.icon;
}

const slug = (s: string) => s.toLowerCase().replace(/_/g, "-");

export function transportLabel(mode: TransportMode | null | undefined) {
  return mode === "PLANE" || !mode ? "Voo" : TRANSPORT_MODES.find((m) => m.mode === mode)!.label;
}

type TripDays = { startDate: Date | null; daysCount: number };
type ItemInput = import("@/lib/validations").TripItemInput;

/** Dia da viagem a partir de uma data (YYYY-MM-DD) ou do número do dia. */
function resolveDay(trip: TripDays, date?: string, dayNumber?: number): number | null {
  if (date && trip.startDate) {
    const diff = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(trip.startDate.toISOString().slice(0, 10) + "T00:00:00Z")) / 86_400_000);
    return diff + 1;
  }
  return dayNumber ?? null;
}

/** Converte o formulário em dados do TripItem (validações que dependem da viagem). */
export function itemDataFromInput(
  input: ItemInput,
  trip: TripDays,
): { data: Omit<import("@prisma/client").Prisma.TripItemUncheckedCreateInput, "tripId"> } | { error: string; field: string } {
  const dayNumber = resolveDay(trip, input.startDate, input.startDay);
  const endDay = resolveDay(trip, input.endDate, input.endDay);
  const outside = (d: number | null) => d !== null && (d < 1 || d > trip.daysCount);
  if (dayNumber === null) return { error: "Informe a data", field: "startDate" };
  if (outside(dayNumber)) return { error: "A data precisa estar dentro da viagem", field: "startDate" };
  if (outside(endDay)) return { error: "A data precisa estar dentro da viagem", field: "endDate" };

  // Hora "de parede" em UTC; viagem sem datas usa 1970-01-01 como data de referência
  const at = (date: string | undefined, time: string | undefined) =>
    time ? new Date(`${trip.startDate && date ? date : "1970-01-01"}T${time}:00Z`) : null;

  const modeTitle = () => {
    const base = transportLabel(input.transportMode);
    const extra = input.code || input.carrier;
    return extra ? `${base} ${extra}` : base;
  };
  const title =
    input.category === "TRANSPORT" ? modeTitle()
    : input.category === "ACCOMMODATION" ? input.title || "Acomodação"
    : input.title!;

  return {
    data: {
      category: input.category,
      title,
      dayNumber,
      endDayNumber: endDay,
      startAt: at(input.startDate, input.startTime),
      endAt: at(input.endDate, input.endTime),
      cost: input.cost ?? null,
      notes: input.notes || null,
      address: input.address || null,
      transportMode: input.category === "TRANSPORT" ? input.transportMode : null,
      carrier: input.carrier || null,
      code: input.code || null,
      originName: input.originName || null,
      destinationName: input.destinationName || null,
    },
  };
}

/** Item salvo → valores do formulário (para editar). */
export function inputFromItem(item: TripItemDTO, tripStartDate: string | null): Partial<Record<keyof ItemInput, string>> {
  const dateOf = (day: number | null) => {
    if (!day || !tripStartDate) return "";
    const d = new Date(Date.parse(tripStartDate.slice(0, 10) + "T00:00:00Z") + (day - 1) * 86_400_000);
    return d.toISOString().slice(0, 10);
  };
  return {
    title: item.category === "TRANSPORT" ? "" : item.title,
    carrier: item.carrier ?? "",
    code: item.code ?? "",
    originName: item.originName ?? "",
    destinationName: item.destinationName ?? "",
    address: item.address ?? "",
    startDate: dateOf(item.dayNumber),
    startDay: String(item.dayNumber),
    startTime: formatTime(item.startAt),
    endDate: dateOf(item.endDayNumber),
    endDay: item.endDayNumber ? String(item.endDayNumber) : "",
    endTime: formatTime(item.endAt),
    cost: item.cost ? formatMoney(item.cost) : "",
    notes: item.notes ?? "",
  };
}

/** "Salvador (SSA)" → "SSA"; sem sigla, devolve o nome. */
export function placeCode(name: string | null) {
  if (!name) return "";
  const m = name.match(/\(([A-Za-z]{3})\)\s*$/);
  return m ? m[1].toUpperCase() : name;
}

/** Hora "de parede" guardada em UTC → "08:00". */
export function formatTime(iso: string | null) {
  if (!iso) return "";
  return iso.slice(11, 16);
}

export function formatMoney(value: number | string | null) {
  if (value === null || value === "") return "";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** "R$ 1.450,00" / "1450,5" / "1450.50" → 1450.5 (vazio → undefined). */
export function parseMoney(text: string): number | undefined {
  const clean = text.replace(/[^\d,.-]/g, "");
  if (!clean) return undefined;
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

/** Linhas do item na linha do tempo (Figma "Item do roteiro"). */
export type ItineraryEntry = { item: TripItemDTO; kind: "single" | "start" | "end" };

export function itineraryForDay(items: TripItemDTO[], day: number): ItineraryEntry[] {
  const entries: ItineraryEntry[] = [];
  for (const item of items) {
    const spans = item.category === "ACCOMMODATION" || item.category === "CAR_RENTAL";
    if (spans && item.endDayNumber && item.endDayNumber !== item.dayNumber) {
      if (item.dayNumber === day) entries.push({ item, kind: "start" });
      if (item.endDayNumber === day) entries.push({ item, kind: "end" });
    } else if (item.dayNumber === day) {
      entries.push({ item, kind: "single" });
    }
  }
  // Ordem do dia: a que a pessoa definiu arrastando (posição); itens novos entram pelo horário
  // (o servidor calcula a posição ao salvar). Empate: horário (check-out pelo horário final).
  const time = (e: ItineraryEntry) => formatTime(e.kind === "end" ? e.item.endAt : e.item.startAt) || "99:99";
  return entries.sort((a, b) => a.item.position - b.item.position || time(a).localeCompare(time(b)));
}

export type EntryKind = ItineraryEntry["kind"];

/**
 * Arrastar um item para outro dia: qual dia muda e quantos dias andou.
 * - Item simples: muda o dia (e o dia de chegada junto, mantendo a duração).
 * - Hospedagem/aluguel: muda só a ponta arrastada (check-in ou check-out). O check-in fica sempre
 *   num dia antes do check-out (no mesmo dia a hospedagem viraria um item de um dia só).
 */
export function moveDays(
  item: Pick<TripItemDTO, "category" | "dayNumber" | "endDayNumber">,
  kind: EntryKind,
  toDay: number,
  daysCount: number,
): { dayNumber: number; endDayNumber: number | null; startDelta: number; endDelta: number } | { error: string } {
  if (toDay < 1 || toDay > daysCount) return { error: "O dia precisa estar dentro da viagem" };
  const car = item.category === "CAR_RENTAL";
  if (kind === "start" && item.endDayNumber) {
    if (toDay >= item.endDayNumber) return { error: car ? "A retirada precisa ser antes do dia da devolução" : "O check-in precisa ser antes do dia do check-out" };
    return { dayNumber: toDay, endDayNumber: item.endDayNumber, startDelta: toDay - item.dayNumber, endDelta: 0 };
  }
  if (kind === "end" && item.endDayNumber) {
    if (toDay <= item.dayNumber) return { error: car ? "A devolução precisa ser depois do dia da retirada" : "O check-out precisa ser depois do dia do check-in" };
    return { dayNumber: item.dayNumber, endDayNumber: toDay, startDelta: 0, endDelta: toDay - item.endDayNumber };
  }
  const delta = toDay - item.dayNumber;
  const end = item.endDayNumber ? item.endDayNumber + delta : null;
  if (end !== null && end > daysCount) return { error: "A chegada ficaria depois do fim da viagem" };
  return { dayNumber: toDay, endDayNumber: end, startDelta: delta, endDelta: delta };
}

/** Textos das 3 linhas do item. */
export function itemLines(entry: ItineraryEntry): { title: string; second: string; third: string; route?: [string, string]; times?: [string, string] } {
  const { item, kind } = entry;
  if (item.category === "TRANSPORT") {
    const times: [string, string] | undefined =
      item.startAt || item.endAt ? [formatTime(item.startAt), formatTime(item.endAt)] : undefined;
    return {
      title: item.title,
      second: "",
      third: "",
      route: [placeCode(item.originName), placeCode(item.destinationName)],
      times,
    };
  }
  const suffix =
    kind === "start" ? (item.category === "CAR_RENTAL" ? " (retirada)" : " (check-in)")
    : kind === "end" ? (item.category === "CAR_RENTAL" ? " (devolução)" : " (check-out)")
    : "";
  const time = formatTime(kind === "end" ? item.endAt : item.startAt);
  if (item.category === "ACCOMMODATION") {
    // Endereço em 2 linhas: "Rua das Rosas, 13" / "Copacabana, Rio de Janeiro"
    const parts = (item.address ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    return { title: item.title + suffix, second: parts.slice(0, 2).join(", "), third: parts.slice(2).join(", ") };
  }
  return { title: item.title + suffix, second: item.address ?? "", third: time };
}
