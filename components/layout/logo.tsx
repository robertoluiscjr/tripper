import { cn } from "@/lib/utils";

/**
 * Logo oficial do Tripper (Figma: componente "Logo", node 2265:2204).
 * Wordmark "tripper" em Montserrat Alternates Bold; um quadrado da cor do
 * fundo cobre o pingo do "i" e o pássaro laranja (bird.svg) ocupa o lugar.
 * Tudo em `em`, então o tamanho é controlado pelo font-size (padrão do Figma: 64px).
 */
export function Logo({
  className,
  variant = "white",
}: {
  className?: string;
  /** "white": texto branco sobre fundo azul · "blue": texto azul sobre fundo branco */
  variant?: "white" | "blue";
}) {
  const onBlue = variant === "white";
  return (
    <span
      role="img"
      aria-label="Tripper"
      className={cn(
        "relative inline-block h-[1.171875em] w-[3.5625em] text-[64px] leading-none",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-[calc(50%-0.539em)] text-center font-logo font-bold leading-[1.2] tracking-[-0.03em]",
          onBlue ? "text-white" : "text-primary",
        )}
      >
        tripper
      </span>
      {/* Retângulo que esconde o pingo do "i" */}
      <span
        aria-hidden
        className={cn(
          "absolute top-[calc(50%-0.28125em)] left-[calc(50%-0.7734em)] size-[0.234375em] -translate-x-1/2 -translate-y-1/2",
          onBlue ? "bg-primary" : "bg-background",
        )}
      />
      {/* Pássaro */}
      <span
        aria-hidden
        className="absolute top-[calc(50%-0.3356em)] left-[calc(50%-0.734em)] flex size-[0.3755em] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/bird.svg" alt="" className="block size-[0.3186em] max-w-none -rotate-[11.43deg]" />
      </span>
    </span>
  );
}

/** Pássaro isolado (ícone do header das Homes, 24px). */
export function BirdIcon({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("flex size-6 items-center justify-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/bird-icon.svg" alt="" width={20.3929} height={20.3929} className="block max-w-none" />
    </span>
  );
}
