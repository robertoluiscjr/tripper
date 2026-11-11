import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Figma "Text Field": só a linha de preenchimento (#B9B9B9), texto 16px; foco em azul
        "h-6 w-full min-w-0 border-0 border-b border-input bg-transparent p-0 pb-1 text-p16 leading-[1.2] text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
