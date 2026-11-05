/**
 * Lista de benefícios do "Planejar (pré-login)" (Figma 3622:4431):
 * ícones azuis 32px + texto 16px Regular.
 */
const BENEFITS = [
  { icon: "/icons/feature-roteiro.svg", text: "Elabore um roteiro personalizado" },
  { icon: "/icons/feature-mapa.svg", text: "Visualize no mapa os pontos de interesse" },
  { icon: "/icons/feature-gastos.svg", text: "Estime os gastos de viagem e controle o orçamento" },
  { icon: "/icons/feature-progresso.svg", text: "Acompanhe a evolução do seu planejamento" },
];

export function PlanejarBenefits() {
  return (
    <ul className="flex flex-col gap-6 px-6">
      {BENEFITS.map((b) => (
        <li key={b.text} className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.icon} alt="" width={32} height={32} className="shrink-0" />
          <span className="text-p16 leading-[1.2] text-foreground">{b.text}</span>
        </li>
      ))}
    </ul>
  );
}
