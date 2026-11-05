import Link from "next/link";
import { BirdIcon } from "@/components/layout/logo";

/**
 * Header azul das Homes (Figma "Header", 393 × 221).
 * Logado: avatar + "Olá, {nome}!" + frase. Pré-login: "Olá, tripper!" + "Faça login…".
 */
export function HomeHeader({ name, image }: { name?: string | null; image?: string | null }) {
  const loggedIn = name !== undefined;
  const firstName = name?.trim().split(/\s+/)[0] || "viajante";

  return (
    <header className="absolute inset-x-0 top-0 h-[221px] bg-primary px-6 text-white">
      <BirdIcon className="absolute top-10 right-[24.5px]" />

      {loggedIn ? (
        <div className="absolute top-[75px] left-6 flex items-center gap-2">
          <Avatar image={image} />
          <h1 className="text-h3 leading-[1.5] font-medium tracking-[-0.03em]">Olá, {firstName}!</h1>
        </div>
      ) : (
        <Link href="/login" className="absolute top-[75px] left-6 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/account-white.svg" alt="" width={32} height={32} />
          <h1 className="text-h3 leading-[1.5] font-medium tracking-[-0.03em]">Olá, tripper!</h1>
        </Link>
      )}

      {loggedIn ? (
        <p className="absolute top-[127px] right-6 left-6 text-h6 leading-[1.2] font-medium tracking-[-0.01em]">
          Gerencie suas viagens para aproveitá-las ao máximo
        </p>
      ) : (
        <p className="absolute top-[135px] right-6 left-6 text-h6 leading-[1.2] font-medium">
          Faça{" "}
          <Link href="/login" className="font-semibold text-secondary underline-offset-4 hover:underline">
            login
          </Link>{" "}
          para acessar suas viagens
        </p>
      )}
    </header>
  );
}

function Avatar({ image }: { image?: string | null }) {
  if (!image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/icons/account-white.svg" alt="" width={32} height={32} />;
  }
  return (
    <span className="flex size-8 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="size-[26px] rounded-full object-cover ring-[1.5px] ring-white" referrerPolicy="no-referrer" />
    </span>
  );
}
