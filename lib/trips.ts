import type { Trip } from "@prisma/client";
import { parsePlan, type ProgressPlan } from "@/lib/progress";

/** Formato serializável de uma viagem (JSON da API / props de client components). */
export type TripDTO = {
  id: string;
  name: string;
  destination: string | null;
  coverImage: string | null;
  coverCredit: string | null;
  latitude: number | null;
  longitude: number | null;
  startDate: string | null; // ISO
  endDate: string | null; // ISO
  daysCount: number;
  status: Trip["status"];
  plannedBudget: string | null;
  /** "Ver Progresso" (null = ainda não configurado) */
  progressPlan: ProgressPlan | null;
  createdAt: string;
};

export function toTripDTO(trip: Trip): TripDTO {
  return {
    id: trip.id,
    name: trip.name,
    destination: trip.destination,
    coverImage: trip.coverImage,
    coverCredit: trip.coverCredit,
    latitude: trip.latitude,
    longitude: trip.longitude,
    startDate: trip.startDate?.toISOString() ?? null,
    endDate: trip.endDate?.toISOString() ?? null,
    daysCount: trip.daysCount,
    status: trip.status,
    plannedBudget: trip.plannedBudget?.toString() ?? null,
    progressPlan: parsePlan(trip.progressPlan),
    createdAt: trip.createdAt.toISOString(),
  };
}

/** "Viagens Anteriores": concluídas ou com data final já passada. */
export function isPastTrip(trip: Pick<TripDTO, "status" | "endDate">, now = new Date()): boolean {
  if (trip.status === "COMPLETED") return true;
  if (!trip.endDate) return false;
  const end = new Date(trip.endDate);
  end.setUTCHours(23, 59, 59, 999);
  return end < now;
}

export function daysLabel(days: number) {
  return days === 1 ? "1 dia" : `${days} dias`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Quantidade de dias (inclusiva) entre duas datas. */
export function daysBetween(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
}
