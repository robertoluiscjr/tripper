import { cn } from "@/lib/utils";

/**
 * Moldura mobile do app (design 393 × 852). No celular ocupa a tela toda;
 * no desktop vira uma coluna centralizada sobre fundo cinza.
 */
export function MobileShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-1 justify-center bg-tripper-light-300">
      <div
        className={cn(
          "relative flex min-h-dvh w-full max-w-md flex-col overflow-x-clip bg-background md:shadow-[0_0_24px_rgba(0,0,0,0.08)]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
