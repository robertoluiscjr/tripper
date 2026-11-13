"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { coverPosition } from "@/lib/destination-photos";
import { ApiError, useTrips } from "@/hooks/use-trips";
import type { TripDTO } from "@/lib/trips";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";

/* eslint-disable @next/next/no-img-element */

/**
 * "Adicionar à viagem" — Figma "Adicionar Compra" (296:1732). Escolher a viagem abre a Tela da
 * Viagem com o formulário "Passeios e Atrações" já preenchido (nome e endereço); a pessoa só
 * escolhe o dia e salva.
 */
export function AddToTripSheet({ open, onOpenChange, title, address }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; address: string }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>{open && <TripPicker title={title} address={address} onPicked={() => onOpenChange(false)} />}</DrawerContent>
    </Drawer>
  );
}

function TripPicker({ title, address, onPicked }: { title: string; address: string; onPicked: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const trips = useTrips(undefined, { enabled: true });
  const loggedOut = trips.error instanceof ApiError && trips.error.status === 401;

  function pick(trip: TripDTO) {
    const query = new URLSearchParams({ novo: "TOUR", titulo: title, endereco: address });
    // Fecha antes de sair: o Next mantém a página anterior guardada (voltar), e o sheet ficaria aberto por cima
    onPicked();
    router.push(`/app/viagens/${trip.id}?${query}`);
  }

  return (
    <div className="flex flex-col pt-[31px] pb-8">
      <DrawerTitle className="px-6 text-h5 leading-[1.2] font-medium text-foreground">Adicionar à viagem</DrawerTitle>
      <DrawerDescription className="sr-only">Escolha a viagem em que “{title}” vai entrar</DrawerDescription>

      {loggedOut ? (
        <div className="flex flex-col px-6">
          <p className="mt-4 text-p16 leading-[1.2] text-muted-foreground">Entre na sua conta para adicionar este passeio ao roteiro de uma viagem.</p>
          <Button asChild size="cta" className="mt-8 self-center">
            <Link href={`/login?${new URLSearchParams({ callbackUrl: pathname })}`} onClick={onPicked}>
              Entrar
            </Link>
          </Button>
        </div>
      ) : trips.isPending ? (
        <div className="mt-8 flex gap-4 px-6">
          <Skeleton className="size-32 rounded-[12px]" />
          <Skeleton className="size-32 rounded-[12px]" />
        </div>
      ) : trips.isError ? (
        <p className="mt-4 px-6 text-p16 leading-[1.2] text-destructive">Não foi possível carregar suas viagens. Tente novamente.</p>
      ) : trips.data.length === 0 ? (
        <p className="mt-4 px-6 text-p16 leading-[1.2] text-muted-foreground">Você ainda não tem viagens. Crie uma para adicionar este passeio.</p>
      ) : (
        // "Small Card with text" 128 × 128: foto + nome em branco; rolagem lateral se houver muitas
        <ul className="mt-8 flex snap-x gap-4 overflow-x-auto scroll-px-6 px-6 [scrollbar-width:none]">
          {trips.data.map((trip) => (
            <li key={trip.id} className="snap-start">
              <button
                type="button"
                onClick={() => pick(trip)}
                aria-label={`Adicionar à viagem ${trip.name}`}
                className="group relative block size-32 overflow-hidden rounded-[12px] bg-tripper-light-500 text-left outline-none ring-ring/50 focus-visible:ring-3"
              >
                {trip.coverImage ? (
                  <Image src={trip.coverImage} alt="" fill sizes="128px" style={{ objectPosition: coverPosition(trip.coverImage) }} className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                ) : (
                  <span className="absolute inset-0 bg-gradient-to-br from-tripper-blue-300 to-tripper-blue-700" />
                )}
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_45%,rgba(0,0,0,0.5)_100%)]" />
                <span className="absolute right-5 bottom-[10px] left-3 line-clamp-2 text-p16 leading-none font-semibold text-white">{trip.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!loggedOut && !trips.isPending && (
        <Button asChild size="pill" className="mt-8 mr-6 self-end">
          <Link href="/app/planejar?nova=1" onClick={onPicked}>
            <img src="/icons/add-white.svg" alt="" width={28} height={28} />
            nova viagem
          </Link>
        </Button>
      )}
    </div>
  );
}
