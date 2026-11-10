/** Só aceita caminhos internos (evita redirecionar para outro site). */
export function safeCallback(value: FormDataEntryValue | string | string[] | null | undefined, fallback = "/app") {
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" && v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\") ? v : fallback;
}
