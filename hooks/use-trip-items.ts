"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/hooks/use-trips";
import type { TripItemDTO } from "@/lib/trip-items";
import type { TripItemInput } from "@/lib/validations";

export const itemKeys = {
  list: (tripId: string) => ["trips", tripId, "items"] as const,
};

export function useTripItems(tripId: string, initialData?: TripItemDTO[]) {
  return useQuery({
    queryKey: itemKeys.list(tripId),
    queryFn: () => api<{ items: TripItemDTO[] }>(`/api/trips/${tripId}/items`).then((d) => d.items),
    initialData,
  });
}

export function useSaveTripItem(tripId: string, itemId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TripItemInput) =>
      api<{ item: TripItemDTO }>(itemId ? `/api/trips/${tripId}/items/${itemId}` : `/api/trips/${tripId}/items`, {
        method: itemId ? "PATCH" : "POST",
        body: JSON.stringify(input),
      }).then((d) => d.item),
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.list(tripId) }),
  });
}

export function useDeleteTripItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api<void>(`/api/trips/${tripId}/items/${itemId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.list(tripId) }),
  });
}
