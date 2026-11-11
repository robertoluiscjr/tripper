import Image from "next/image";
import Link from "next/link";

/**
 * "Card with text (new)" + descrição (Figma 2583:2689) — 345 × 208, raio 12,
 * gradiente inferior e título branco 20px SemiBold.
 */
export function HomeCard({
  href,
  onClick,
  title,
  description,
  image,
  imageTop,
  imageFrame = { left: "0", width: "100%" },
  gradient = "linear-gradient(180deg, rgba(255,255,255,0) 82.452%, rgba(0,0,0,0.5) 100%)",
  priority,
}: {
  /** navega para outra tela… */
  href?: string;
  /** …ou executa uma ação na própria tela (ex.: abrir o bottom sheet Nova Viagem) */
  onClick?: () => void;
  title: string;
  description: string;
  image: string;
  /** deslocamento vertical da foto no recorte do Figma (ex.: "-6.29%") */
  imageTop: string;
  imageFrame?: { left: string; width: string };
  gradient?: string;
  priority?: boolean;
}) {
  const content = (
    <>
      <div className="relative aspect-[345/208] w-full overflow-hidden rounded-[12px] ring-ring/50 transition-shadow group-focus-visible:ring-3">
        {/* Área da imagem do Figma: 345 × 230 (inset bottom -10.58%) */}
        <div className="absolute inset-x-0 top-0 h-[110.58%]">
          <div className="absolute h-full" style={{ top: imageTop, ...imageFrame }}>
            <Image
              src={image}
              alt=""
              fill
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              sizes="(max-width: 448px) 92vw, 400px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </div>
        <div className="absolute inset-0 rounded-[12px]" style={{ backgroundImage: gradient }} />
        <h2 className="absolute bottom-[5.77%] left-[4.64%] text-h5 font-semibold leading-[1.2] text-white">
          {title}
        </h2>
      </div>
      <p className="text-p14 leading-[1.2] text-muted-foreground">{description}</p>
    </>
  );

  const className = "group flex w-full flex-col gap-2 text-left outline-none";
  return onClick ? (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  ) : (
    <Link href={href ?? "#"} className={className}>
      {content}
    </Link>
  );
}
