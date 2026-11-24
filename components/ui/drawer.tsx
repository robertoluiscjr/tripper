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
 * Teclado no celular (principalmente Safari do iPhone): o teclado cobre a parte de baixo da tela e o
 * navegador nem sempre informa direito quanto ele ocupa. O ajuste automático do Vaul
 * (repositionInputs) depende dessa medida, e quando ela falha a folha fica parada no meio da tela
 * com as sugestões do Destino atrás do teclado, ou "pula" ao trocar de campo.
 *
 * Solução que não depende da medida (padrão de busca do Airbnb e do Google Maps): ao tocar num campo
 * de texto, a folha sobe até o topo da tela e o campo vai para o alto, com espaço livre logo abaixo
 * (sugestões). Ao sair do campo, a folha volta ao tamanho normal. Só em telas de toque.
 * Diagnóstico: abra o app com ?debug=teclado para ver as medidas na tela (fica salvo no aparelho;
 * ?debug=0 desliga).
 */
const FIELD = "input:not([type=checkbox]):not([type=radio]):not([type=date]):not([type=hidden]), textarea, [contenteditable=true]"
const TOP = "calc(env(safe-area-inset-top) + 8px)"

function isTextField(node: EventTarget | null): node is HTMLElement {
  return node instanceof HTMLElement && node.matches(FIELD)
}

function useKeyboardAwareSheet(contentRef: React.RefObject<HTMLDivElement | null>) {
  React.useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return
    const timers: ReturnType<typeof setTimeout>[] = []
    let frame = 0

    // Aplica (de novo) a posição "teclado": depois do Vaul e da animação do teclado (~300 ms).
    // A folha ocupa exatamente o que está visível: o Safari "desce" a tela (visualViewport.offsetTop)
    // para mostrar o campo, e a folha, presa à página, subia junto e sumia acima do topo.
    const settle = () => {
      const el = contentRef.current
      const field = document.activeElement
      if (!el || !isTextField(field) || !el.contains(field)) return
      el.dataset.keyboard = "" // também cobre o foco automático (teclado aberto antes da folha "ver")
      const vv = window.visualViewport
      const offset = vv?.offsetTop ?? 0
      const keyboard = vv ? Math.max(0, window.innerHeight - vv.height - offset) : 0
      el.style.top = `calc(${offset}px + ${TOP})`
      el.style.marginTop = "0px"
      el.style.height = "auto"
      el.style.maxHeight = "none"
      el.style.bottom = `${keyboard > 80 ? keyboard : 0}px`
      pinToTop(el, field)
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => requestAnimationFrame(settle))
      timers.push(setTimeout(settle, 350), setTimeout(settle, 700))
    }

    // Foco num campo, toque num campo que já tinha o foco (o iPhone abre o teclado sem novo
    // "foco": ex. Destino com foco automático) ou digitação: entra no modo teclado
    const activate = (e: Event) => {
      const el = contentRef.current
      if (!el || !isTextField(e.target) || !el.contains(e.target)) return
      el.dataset.keyboard = ""
      settle()
      schedule()
    }
    const onFocusIn = activate
    // Com o teclado aberto, arrastar não fecha a folha (como as folhas do iPhone): fechar no meio da
    // digitação apagava o que já estava preenchido. Feche o teclado (✓) e depois arraste.
    // Bloqueia só o início do arraste do Vaul; rolar, tocar e digitar continuam normais.
    const onPointerDown = (e: PointerEvent) => {
      const el = contentRef.current
      if (el && "keyboard" in el.dataset && el.contains(e.target as Node)) e.stopPropagation()
    }
    const onFocusOut = () => {
      // Espera o próximo foco: trocar de campo não deve fazer a folha descer e subir
      timers.push(
        setTimeout(() => {
          const el = contentRef.current
          const field = document.activeElement
          if (!el || (isTextField(field) && el.contains(field))) return
          delete el.dataset.keyboard
          el.style.top = ""
          el.style.marginTop = ""
          el.style.height = ""
          el.style.maxHeight = ""
          el.style.bottom = "0px"
        }, 120)
      )
    }
    const vv = window.visualViewport
    document.addEventListener("focusin", onFocusIn)
    document.addEventListener("focusout", onFocusOut)
    document.addEventListener("pointerup", activate, true)
    document.addEventListener("input", activate, true)
    document.addEventListener("pointerdown", onPointerDown, true)
    // Teclado abrindo/fechando ou o Safari deslocando a tela: reposiciona
    vv?.addEventListener("resize", schedule)
    vv?.addEventListener("scroll", schedule)
    return () => {
      vv?.removeEventListener("scroll", schedule)
      cancelAnimationFrame(frame)
      timers.forEach(clearTimeout)
      document.removeEventListener("focusin", onFocusIn)
      document.removeEventListener("focusout", onFocusOut)
      document.removeEventListener("pointerup", activate, true)
      document.removeEventListener("input", activate, true)
      document.removeEventListener("pointerdown", onPointerDown, true)
      vv?.removeEventListener("resize", schedule)
    }
  }, [contentRef])
}

/** Rola só a área interna da folha (nunca a página) para pôr o campo no alto. */
function pinToTop(content: HTMLElement, field: HTMLElement) {
  const scroller = content.querySelector<HTMLElement>("[data-slot=drawer-scroll]")
  if (!scroller || !scroller.contains(field)) return
  const offset = field.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 24
  if (Math.abs(offset) > 2) scroller.scrollTop += offset
}

/** Painel de diagnóstico do teclado (?debug=teclado): medidas reais do aparelho, para prints. */
function KeyboardDebug({ contentRef }: { contentRef: React.RefObject<HTMLDivElement | null> }) {
  const [text, setText] = React.useState("")
  React.useEffect(() => {
    let on = false
    try {
      const param = new URLSearchParams(window.location.search).get("debug")
      if (param === "teclado") localStorage.setItem("tripper:debug-teclado", "1")
      if (param === "0") localStorage.removeItem("tripper:debug-teclado")
      on = localStorage.getItem("tripper:debug-teclado") === "1"
    } catch {
      // armazenamento bloqueado: sem diagnóstico
    }
    if (!on) return
    const id = setInterval(() => {
      const vv = window.visualViewport
      const el = contentRef.current
      const r = el?.getBoundingClientRect()
      const scroller = el?.querySelector<HTMLElement>("[data-slot=drawer-scroll]")
      const a = document.activeElement as HTMLElement | null
      setText(
        [
          `janela ${window.innerHeight} · visível ${vv?.height.toFixed(0)} · desloc. ${vv?.offsetTop.toFixed(0)}`,
          `folha topo ${r?.top.toFixed(0)} · base ${r?.bottom.toFixed(0)} · altura ${r?.height.toFixed(0)}`,
          `estilo top ${el?.style.top || "-"} · bottom ${el?.style.bottom || "-"} · height ${el?.style.height || "-"}`,
          `rolagem ${scroller?.scrollTop.toFixed(0)} · teclado? ${el && "keyboard" in el.dataset ? "sim" : "não"}`,
          `foco ${a?.tagName.toLowerCase()} ${a?.getAttribute("aria-label") ?? ""} · topo ${a?.getBoundingClientRect().top.toFixed(0)}`,
        ].join("\n")
      )
    }, 300)
    return () => clearInterval(id)
  }, [contentRef])
  if (!text) return null
  return (
    <pre className="pointer-events-none fixed top-[env(safe-area-inset-top)] left-1 z-[100] max-w-[96vw] rounded bg-black/80 p-2 text-[10px] leading-tight whitespace-pre-wrap text-white">
      {text}
    </pre>
  )
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
        {/* Conteúdo rola por dentro quando não cabe. Com teclado: folga embaixo para qualquer campo
            poder subir até o alto (o resto fica atrás do teclado) */}
        <div
          data-slot="drawer-scroll"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain group-data-[keyboard]/drawer-content:pb-[60vh]"
        >
          {children}
        </div>
        <KeyboardDebug contentRef={contentRef} />
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
