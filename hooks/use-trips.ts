"use client";

import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TripDTO } from "@/lib/trips";
import type { CreateTripInput } from "@/lib/validations";
import type { ProgressPlan } from "@/lib/progress";

export const tripKeys = {
  all: ["trips"] as const,
  detail: (id: string) => ["trips", id] as const,
};

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? "Algo deu errado. Tente novamente.", res.status, data.code);
  return data as T;
}

export function useTrips(initialData?: TripDTO[], { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: tripKeys.all,
    queryFn: () => api<{ trips: TripDTO[] }>("/api/trips").then((d) => d.trips),
    initialData,
    enabled,
  });
}

export function useTrip(id: string, initialData?: TripDTO) {
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: () => api<{ trip: TripDTO }>(`/api/trips/${id}`).then((d) => d.trip),
    initialData,
  });
}

export type TripFormInput = Omit<CreateTripInput, "startDate" | "endDate"> & {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
};

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TripFormInput) =>
      api<{ trip: TripDTO }>("/api/trips", { method: "POST", body: JSON.stringify(input) }).then((d) => d.trip),
    onSuccess: (trip) => {
      qc.setQueryData(tripKeys.detail(trip.id), trip);
      qc.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}

export function useUpdateTrip(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TripFormInput) =>
      api<{ trip: TripDTO }>(`/api/trips/${id}`, { method: "PATCH", body: JSON.stringify(input) }).then((d) => d.trip),
    onSuccess: (trip) => {
      qc.setQueryData(tripKeys.detail(id), trip);
      qc.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}

/** "Estimar Gastos": Valor Total Planejado. */
export function useUpdateBudget(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plannedBudget: number) =>
      api<{ trip: TripDTO }>(`/api/trips/${id}/budget`, { method: "PATCH", body: JSON.stringify({ plannedBudget }) }).then((d) => d.trip),
    onSuccess: (trip) => {
      qc.setQueryData(tripKeys.detail(id), trip);
      qc.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}

/** "Ver Progresso": salva o plano; a tela muda na hora (e volta se der erro). */
export function useUpdateProgressPlan(id: string) {
  const qc = useQueryClient();
  const latest = useRef(0); // toques rápidos: só a resposta do último salvamento atualiza a tela
  const mutation = useMutation({
    // scope: os salvamentos rodam um de cada vez, na ordem dos toques
    scope: { id: `progress-${id}` },
    mutationFn: ({ plan }: { plan: ProgressPlan; seq: number }) =>
      api<{ trip: TripDTO }>(`/api/trips/${id}/progress`, { method: "PATCH", body: JSON.stringify({ plan }) }).then((d) => d.trip),
    onMutate: async ({ plan }) => {
      await qc.cancelQueries({ queryKey: tripKeys.detail(id) });
      const previous = qc.getQueryData<TripDTO>(tripKeys.detail(id));
      if (previous) qc.setQueryData<TripDTO>(tripKeys.detail(id), { ...previous, progressPlan: plan });
      return { previous };
    },
    onError: (_err, { seq }, context) => {
      if (seq === latest.current && context?.previous) qc.setQueryData(tripKeys.detail(id), context.previous);
    },
    onSuccess: (trip, { seq }) => {
      if (seq === latest.current) qc.setQueryData(tripKeys.detail(id), trip);
    },
  });
  return {
    ...mutation,
    save: (plan: ProgressPlan, options?: { onError?: () => void }) =>
      mutation.mutate({ plan, seq: ++latest.current }, { onError: options?.onError }),
  };
}

export function useDeleteTrip(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>(`/api/trips/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.removeQueries({ queryKey: tripKeys.detail(id) });
      qc.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}
