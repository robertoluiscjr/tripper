"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TripDTO } from "@/lib/trips";
import type { CreateTripInput } from "@/lib/validations";

export const tripKeys = {
  all: ["trips"] as const,
  detail: (id: string) => ["trips", id] as const,
};

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
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
