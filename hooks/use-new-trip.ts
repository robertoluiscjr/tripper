"use client";

import { useRouter } from "next/navigation";
import { ApiError, useCreateTrip, type TripFormInput } from "@/hooks/use-trips";
import { saveTripDraft } from "@/lib/trip-draft";

/**
 * "Criar" do bottom sheet Nova Viagem (Home e Planejar).
 * Logado: cria e abre a Tela da Viagem. Sem login (ou sessão expirada → 401): guarda o
 * rascunho e leva ao login; ao voltar, /app/planejar?rascunho=1 cria a viagem.
 */
export function useNewTripSubmit(loggedIn?: boolean) {
  const router = useRouter();
  const createTrip = useCreateTrip();

  function continueAfterLogin(input: TripFormInput) {
    saveTripDraft(input);
    router.push(`/login?callbackUrl=${encodeURIComponent("/app/planejar?rascunho=1")}`);
  }

  async function submit(input: TripFormInput) {
    if (loggedIn === false) return continueAfterLogin(input);
    try {
      const trip = await createTrip.mutateAsync(input);
      router.push(`/app/viagens/${trip.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return continueAfterLogin(input);
      throw err;
    }
  }

  return { submit, pending: createTrip.isPending };
}
