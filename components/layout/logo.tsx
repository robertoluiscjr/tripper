import { cn } from "@/lib/utils";

/**
 * Wordmark provisório do Tripper. Substituir pelo SVG oficial exportado do
 * Figma (logo com o pássaro laranja sobre o "i") em /public/logo.svg.
 */
export function Logo({
  className,
  variant = "blue",
}: {
  className?: string;
  variant?: "blue" | "white";
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-baseline text-3xl font-semibold tracking-tight",
        variant === "white" ? "text-white" : "text-primary",
        className,
      )}
      aria-label="Tripper"
    >
      tr
      <span className="relative">
        i
        <span
          aria-hidden
          className="absolute -top-[0.12em] left-1/2 size-[0.22em] -translate-x-1/2 rounded-full bg-secondary"
        />
      </span>
      pper
    </span>
  );
}
