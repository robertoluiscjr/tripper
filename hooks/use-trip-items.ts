"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/hooks/use-trips";
import type { TripItemDTO } from "@/lib/trip-items";
import type { MoveTripItemInput, TripItemInput } from "@/lib/validations";

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

// --- Excluir item com "Desfazer" (Material: Snackbar · NN/g: desfazer > confirmar em ações leves) ---------

/** Itens marcados para excluir: somem da tela na hora e só são apagados quando o aviso some. */
const pendingDeletes = new Map<string, string>(); // itemId → tripId
const listeners = new Set<() => void>();
let pendingSnapshot: ReadonlySet<string> = new Set();
const EMPTY_SET: ReadonlySet<string> = new Set();
function emitPending() {
  pendingSnapshot = new Set(pendingDeletes.keys());
  listeners.forEach((l) => l());
}

/** Ids dos itens excluídos que ainda podem ser desfeitos (para escondê-los das listas). */
export function usePendingDeletes(): ReadonlySet<string> {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => pendingSnapshot,
    () => EMPTY_SET,
  );
}

// Fechou a aba com o aviso aberto: apaga mesmo assim (keepalive sobrevive ao fechamento)
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    for (const [itemId, tripId] of pendingDeletes) {
      fetch(`/api/trips/${tripId}/items/${itemId}`, { method: "DELETE", keepalive: true });
    }
    pendingDeletes.clear();
  });
}

export function useDeleteItemWithUndo(tripId: string) {
  const qc = useQueryClient();
  return (item: TripItemDTO) => {
    pendingDeletes.set(item.id, tripId);
    emitPending();
    let settled = false;
    const undo = () => {
      if (settled) return;
      settled = true;
      pendingDeletes.delete(item.id);
      emitPending();
    };
    const commit = async () => {
      if (settled) return;
      settled = true;
      if (!pendingDeletes.has(item.id)) return; // já enviado no pagehide
      try {
        await api<void>(`/api/trips/${tripId}/items/${item.id}`, { method: "DELETE" });
        await qc.invalidateQueries({ queryKey: itemKeys.list(tripId) });
      } catch {
        toast.error("Não foi possível excluir o item.");
      } finally {
        pendingDeletes.delete(item.id);
        emitPending();
      }
    };
    toast("Item excluído", {
      description: item.title,
      duration: 5000,
      action: { label: "Desfazer", onClick: undo },
      onAutoClose: commit,
      onDismiss: commit,
    });
  };
}

// --- Arrastar e soltar (ícone "Drag Indicator") ----------------------------------------------------

/** optimistic: a lista já com o item no novo lugar (aplicada antes da resposta do servidor) */
type MoveVars = MoveTripItemInput & { optimistic: TripItemDTO[] };

/** Move um item para outro dia/posição: a tela muda na hora e o servidor confirma em seguida. */
export function useMoveTripItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, kind, toDay, order }: MoveVars) =>
      api<{ items: TripItemDTO[] }>(`/api/trips/${tripId}/items/reorder`, {
        method: "POST",
        body: JSON.stringify({ itemId, kind, toDay, order }),
      }).then((d) => d.items),
    onMutate: async (input: MoveVars) => {
      await qc.cancelQueries({ queryKey: itemKeys.list(tripId) });
      const previous = qc.getQueryData<TripItemDTO[]>(itemKeys.list(tripId));
      qc.setQueryData(itemKeys.list(tripId), input.optimistic);
      return { previous };
    },
    onError: (err, _input, context) => {
      if (context?.previous) qc.setQueryData(itemKeys.list(tripId), context.previous);
      toast.error(err instanceof Error && err.message ? err.message : "Não foi possível mover o item.");
    },
    onSuccess: (items) => qc.setQueryData(itemKeys.list(tripId), items),
  });
}
