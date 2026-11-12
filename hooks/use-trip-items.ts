"use client";

import { useEffect, useRef } from "react";
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

/**
 * Pino no mapa + foto real: para cada item ainda sem pino (recém-salvo ou antigo), pede ao
 * servidor, um de cada vez (o OpenStreetMap aceita 1 busca por segundo), e atualiza a lista.
 * Cada item é tentado uma vez por visita à viagem.
 */
export function useResolvePlaces(tripId: string, items: TripItemDTO[]) {
  const qc = useQueryClient();
  const requested = useRef(new Set<string>());
  // Item editado volta sem pino quando o lugar muda: a chave inclui os campos do lugar
  const pendingKey = items
    .filter((i) => i.latitude === null)
    .map((i) => [i.id, i.title, i.address, i.destinationName, i.transportMode].join("~"))
    .join("|");

  useEffect(() => {
    const keys = pendingKey ? pendingKey.split("|").filter((k) => !requested.current.has(k)) : [];
    if (!keys.length) return;
    let active = true;
    (async () => {
      for (const key of keys) {
        if (!active) break;
        requested.current.add(key);
        const id = key.split("~")[0];
        try {
          const { item } = await api<{ item: TripItemDTO }>(`/api/trips/${tripId}/items/${id}/place`, { method: "POST" });
          qc.setQueryData<TripItemDTO[]>(itemKeys.list(tripId), (list) => list?.map((i) => (i.id === item.id ? item : i)));
        } catch {
          requested.current.delete(key); // falhou (rede): tenta de novo na próxima vez
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [pendingKey, tripId, qc]);
}
