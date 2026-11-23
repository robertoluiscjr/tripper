"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Drawer as DrawerPrimitive } from "vaul"

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * Teclado do iPhone (Safari): o teclado não encolhe a página, só a "área visível" (visualViewport).
 * O ajuste automático do Vaul (repositionInputs) corta a altura da folha sem deixar o conteúdo rolar
 * e se confunde ao trocar de campo (alterna "teclado aberto/fechado" a cada mudança > 60px, como a
 * barra de sugestões do teclado aparecendo). Resultado: sugestões do Destino atrás do teclado e a
 * folha "pulando" ao tocar em outro campo.
 * Aqui, depois do ajuste do Vaul, a folha passa a ocupar exatamente o espaço acima do teclado, com o
 * conteúdo rolando por dentro, e o campo em foco é trazido para a vista (o Destino vai para o topo,
 * para as 5 sugestões caberem abaixo dele).
 */
const KEYBOARD_MIN = 80 // abaixo disso é a barra do Safari mudando, não o teclado
const TOP_GAP = 12 // folga entre o topo da área visível e a folha

function useKeyboardAwareSheet(contentRef: React.RefObject<HTMLDivElement | null>) {
  React.useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    let frame = 0

    const apply = (reveal: boolean) => {
      cancelAnimationFrame(frame)
      // 2 quadros: roda depois do ajuste do próprio Vaul (que reage ao mesmo evento)
      frame = requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const el = contentRef.current
          if (!el) return
          const keyboard = window.innerHeight - vv.height - vv.offsetTop
          if (keyboard > KEYBOARD_MIN) {
            el.style.bottom = `${keyboard}px`
            el.style.height = "auto"
            el.style.maxHeight = `${vv.height - TOP_GAP}px`
            if (reveal) revealFocused(el)
          } else if (el.style.maxHeight) {
            el.style.bottom = "0px"
            el.style.height = ""
            el.style.maxHeight = ""
          }
        })
      )
    }

    const onViewport = () => apply(true)
    // Trocar de campo com o teclado já aberto: só traz o novo campo para a vista
    const onFocusIn = (e: FocusEvent) => {
      if (contentRef.current?.contains(e.target as Node)) apply(true)
    }
    vv.addEventListener("resize", onViewport)
    vv.addEventListener("scroll", onViewport)
    document.addEventListener("focusin", onFocusIn)
    return () => {
      cancelAnimationFrame(frame)
      vv.removeEventListener("resize", onViewport)
      vv.removeEventListener("scroll", onViewport)
      document.removeEventListener("focusin", onFocusIn)
    }
  }, [contentRef])
}

/** Rola só a área interna da folha (nunca a página) para mostrar o campo em foco. */
function revealFocused(content: HTMLElement) {
  const field = document.activeElement as HTMLElement | null
  const scroller = content.querySelector<HTMLElement>("[data-slot=drawer-scroll]")
  if (!field || !scroller || !scroller.contains(field)) return
  const box = scroller.getBoundingClientRect()
  const target = field.getBoundingClientRect()
  const margin = 16
  if (field.getAttribute("role") === "combobox") {
    // Campo com sugestões: no topo, com a lista inteira visível abaixo
    scroller.scrollTop += target.top - box.top - margin
  } else if (target.top < box.top + margin) {
    scroller.scrollTop += target.top - box.top - margin
  } else if (target.bottom > box.bottom - margin) {
    scroller.scrollTop += target.bottom - box.bottom + margin
  }
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  useKeyboardAwareSheet(contentRef)
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={contentRef}
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content fixed z-50 flex h-auto flex-col bg-popover text-sm text-popover-foreground data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:right-[var(--removed-body-scroll-bar-size,0px)] data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mx-auto data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[90dvh] data-[vaul-drawer-direction=bottom]:max-w-md data-[vaul-drawer-direction=bottom]:rounded-t-[8px] data-[vaul-drawer-direction=bottom]:pb-[env(safe-area-inset-bottom)] data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:rounded-r-xl data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-l-xl data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-xl data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        {/* right = --removed-body-scroll-bar-size: a trava de rolagem do sheet põe uma margem
            à direita no <body> (desloca a coluna do app); descontar o mesmo valor mantém o
            sheet centralizado exatamente sobre a coluna. */}
        {/* "Barra do Bottom Sheet" do Figma: 56 × 2px, #B9B9B9, a 16px do topo */}
        <div className="mx-auto mt-[15px] hidden h-[2px] w-14 shrink-0 rounded-full bg-input group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {/* Conteúdo rola por dentro quando não cabe (ex.: teclado aberto no iPhone) */}
        <div data-slot="drawer-scroll" className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          {children}
        </div>
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-0.5 md:text-left",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
