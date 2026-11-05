/** Controle do onboarding (exibido só no primeiro acesso do dispositivo). */
const KEY = "tripper:onboarding-visto";

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingSeen() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // modo privado / storage bloqueado: segue sem persistir
  }
}
