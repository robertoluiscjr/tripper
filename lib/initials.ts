/** Iniciais para o avatar de quem não tem foto: "Ana Medeiros" → "AM", "Roberto" → "R". */
export function initials(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return "";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toLocaleUpperCase("pt-BR");
}
