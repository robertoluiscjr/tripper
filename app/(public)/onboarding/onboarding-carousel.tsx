"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { markOnboardingSeen } from "@/lib/onboarding";

/**
 * Onboarding 1–3 (Figma 3195:3347 · 2626:2687 · 3141:3255).
 * Criado após o 2º teste de usabilidade e aprovado no 3º.
 * Foto ocupa a parte de cima; gradiente preto (58% → 75%) leva ao texto.
 * Navegação: Pular / Próximo, indicador de página e swipe.
 */
type Slide = {
  title: string;
  text: string;
  image: string;
  /** altura da área da foto, em % da tela (Figma: 640, 671 e 639 de 852) */
  photoHeight: string;
  /** recorte da imagem dentro da área da foto (geometria do Figma) */
  frame: React.CSSProperties;
};

const SLIDES: Slide[] = [
  {
    title: "Planeje sua próxima viagem e tenha uma experiência inesquecível",
    text: "Elabore um roteiro personalizado, estime os gastos da viagem e acompanhe a evolução do seu planejamento.",
    image: "/images/onboarding/onboarding-1.webp",
    photoHeight: "75.12%",
    frame: { left: "-19.39%", width: "144.81%", top: "-33.125%", height: "133.125%" },
  },
  {
    title: "Busque a viagem perfeita para você",
    text: "Encontre passagens, hospedagens, passeios e pacotes que atendam às suas necessidades.",
    image: "/images/onboarding/onboarding-2.webp",
    photoHeight: "78.76%",
    frame: { left: "-7.42%", width: "113.88%", top: "0", height: "100%" },
  },
  {
    title: "Organize sua viagem com facilidade",
    text: "Faça tudo com segurança e praticidade, ao centralizar todos os detalhes de suas viagens em um único lugar.",
    image: "/images/onboarding/onboarding-3.webp",
    photoHeight: "75%",
    // No Figma a foto está espelhada duas vezes (orientação original, posição espelhada)
    frame: { left: "-7.57%", width: "121.81%", top: "0", height: "99.88%" },
  },
];

export function OnboardingCarousel() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const isLast = index === SLIDES.length - 1;

  function finish() {
    markOnboardingSeen();
    router.replace("/app", { transitionTypes: ["dissolve"] });
  }

  function next() {
    if (isLast) finish();
    else setIndex((i) => i + 1);
  }

  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Apresentação do Tripper"
      className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-black"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx < -40) next();
        if (dx > 40) prev();
        touchX.current = null;
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      }}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          aria-hidden={i !== index}
          className={cn(
            // Figma: "Dissolve" de 300ms, Ease out, entre as telas do onboarding
            "absolute inset-0 transition-opacity duration-300 ease-figma-out",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {/* Foto */}
          <div
            className="absolute inset-x-0 top-0 overflow-hidden"
            style={{ height: slide.photoHeight }}
          >
            <div className="absolute" style={slide.frame}>
              <Image src={slide.image} alt="" fill loading="eager" fetchPriority={i === 0 ? "high" : "low"} sizes="(max-width: 448px) 150vw, 650px" className="object-cover" />
            </div>
          </div>
          {/* Gradiente */}
          <div
            className="absolute inset-0"
            style={{ backgroundImage: "linear-gradient(179.92deg, rgba(0,0,0,0) 58.269%, #000 75.084%, #000 99.968%)" }}
          />
        </div>
      ))}

      {/* Texto */}
      <div className="relative mt-auto flex flex-col gap-5 px-6 pb-[44px]">
        {/* Textos empilhados (alinhados por baixo) para dissolverem junto com a foto */}
        <div className="grid items-end" aria-live="polite">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.image}
              aria-hidden={i !== index}
              className={cn(
                "col-start-1 row-start-1 flex flex-col gap-5 transition-opacity duration-300 ease-figma-out",
                i === index ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              {i === index ? (
                <h1 className="text-h4 font-semibold leading-[1.2] tracking-[-0.03em] text-white">{slide.title}</h1>
              ) : (
                <p className="text-h4 font-semibold leading-[1.2] tracking-[-0.03em] text-white">{slide.title}</p>
              )}
              <p className="min-h-[54px] text-p15 leading-[1.2] tracking-[-0.01em] text-white">{slide.text}</p>
            </div>
          ))}
        </div>

        {/* Base: Pular · indicador · Próximo */}
        <div className="relative mt-[28px] flex h-[17px] items-center justify-between pr-2 pl-4">
          {isLast ? (
            <span />
          ) : (
            <button type="button" onClick={finish} className="text-p14 font-medium text-primary">
              Pular
            </button>
          )}
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-[6px]" role="tablist" aria-label="Página">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Página ${i + 1} de ${SLIDES.length}`}
                onClick={() => setIndex(i)}
                className="flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={i === index ? "/icons/dot-active.svg" : "/icons/dot.svg"}
                  alt=""
                  width={i === index ? 7 : 6}
                  height={i === index ? 7 : 6}
                />
              </button>
            ))}
          </div>
          <button type="button" onClick={next} className="text-p14 font-medium text-primary">
            Próximo
          </button>
        </div>
      </div>
    </section>
  );
}
