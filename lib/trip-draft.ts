import type { TripFormInput } from "@/hooks/use-trips";

/**
 * Rascunho da "Nova Viagem" preenchida antes do login (protótipo: Nova Viagem pré-login).
 * Fica no localStorage — sobrevive ao login com Google e ao link do e-mail aberto em outra aba
 * do mesmo navegador — e vale por 24 h.
 */
const KEY = "tripper:trip-draft";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function saveTripDraft(input: TripFormInput) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ input, savedAt: Date.now() }));
  } catch {
    // modo privado / armazenamento bloqueado: segue sem rascunho
  }
}

/** Lê e apaga o rascunho (uso único). */
export function takeTripDraft(): TripFormInput | null {
  try {
    const raw = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    if (!raw) return null;
    const { input, savedAt } = JSON.parse(raw) as { input: TripFormInput; savedAt: number };
    return Date.now() - savedAt <= MAX_AGE_MS ? input : null;
  } catch {
    return null;
  }
}
