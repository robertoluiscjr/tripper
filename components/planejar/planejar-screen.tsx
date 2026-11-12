"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BirdIcon } from "@/components/layout/logo";
import { ApiError, useCreateTrip, useTrips } from "@/hooks/use-trips";
import { useNewTripSubmit } from "@/hooks/use-new-trip";
import { takeTripDraft } from "@/lib/trip-draft";
import { isPastTrip, type TripDTO } from "@/lib/trips";
import { PlanejarHeader, type PlanejarTab } from "./planejar-tabs";
import { PlanejarBenefits } from "./planejar-benefits";
import { TripCard } from "./trip-card";
import { TripFormSheet } from "./trip-form-sheet";

/* eslint-disable @next/next/no-img-element */

/**
 * Planejar — Figma "Planejar" (214:2250) e "Planejar (pré-login)" (3622:4431).
 * Pré-login, "Nova Viagem" abre o bottom sheet normalmente; ao tocar em Criar, o rascunho é guardado,
 * a pessoa faz login e volta com ?rascunho=1 — aí a viagem é criada e a Tela da Viagem abre.
 */
export function PlanejarScreen({
  loggedIn,
  initialTrips,
  openNewTrip = false,
  resumeDraft = false,
}: {
  loggedIn: boolean;
  initialTrips?: TripDTO[];
  openNewTrip?: boolean;
  resumeDraft?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<PlanejarTab>("proximas");
  const [sheetOpen, setSheetOpen] = useState(openNewTrip);
  const trips = useTrips(loggedIn ? initialTrips : undefined, { enabled: loggedIn });
  const createTrip = useCreateTrip();

  const list = (trips.data ?? []).filter((t) => (tab === "anteriores" ? isPastTrip(t) : !isPastTrip(t)));

  // Depois do login: cria a viagem que foi preenchida antes de entrar (uma vez só)
  const resumed = useRef(false);
  useEffect(() => {
    if (!loggedIn || !resumeDraft || resumed.current) return;
    resumed.current = true;
    const draft = takeTripDraft();
    if (!draft) {
      router.replace("/app/planejar");
      return;
    }
    createTrip
      .mutateAsync(draft)
      .then((trip) => router.replace(`/app/viagens/${trip.id}`))
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Não foi possível criar a viagem.");
        router.replace("/app/planejar");
      });
  }, [loggedIn, resumeDraft, createTrip, router]);

  const newTrip = useNewTripSubmit(loggedIn);

  return (
    <main className="relative flex flex-1 flex-col pb-8">
      <PlanejarHeader tab={tab} onTabChange={setTab} />

      {!loggedIn ? (
        <div className="mt-16 flex flex-col">
          <PlanejarBenefits />
          <Link
            href="/login?callbackUrl=/app/planejar"
            className="mx-auto mt-12 flex h-[38px] w-[319px] max-w-[calc(100%-48px)] items-center justify-center gap-[6px] rounded-[20px] border border-primary bg-white pr-4 pl-3 text-p16 leading-[1.2] font-medium whitespace-nowrap text-primary transition-colors hover:bg-tripper-blue-300/5"
          >
            <BirdIcon />
            Faça login para acessar suas viagens
          </Link>
        </div>
      ) : list.length > 0 ? (
        <ul className="mt-10 flex flex-col gap-8 px-6">
          {list.map((trip, i) => (
            <li key={trip.id}>
              <TripCard trip={trip} priority={i === 0} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState tab={tab} />
      )}

      {/* "+ nova viagem" (Figma 214:2300) — fixo acima da tab bar */}
      <div className="pointer-events-none sticky bottom-[104px] z-30 mt-auto pt-8 flex justify-end px-6">
        <Button size="pill" onClick={() => setSheetOpen(true)} className="pointer-events-auto">
          <img src="/icons/add-white.svg" alt="" width={28} height={28} />
          nova viagem
        </Button>
      </div>

      <TripFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        pending={newTrip.pending}
        onSubmit={newTrip.submit}
      />
    </main>
  );
}

/** Carregamento: título e abas reais + cards em skeleton. */
export function PlanejarSkeleton() {
  return (
    <main className="relative flex flex-1 flex-col pb-8">
      <PlanejarHeader tab="proximas" onTabChange={() => {}} />
      <div className="mt-10 flex flex-col gap-2 px-6">
        <Skeleton className="aspect-[345/169] w-full rounded-[12px]" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-16" />
      </div>
    </main>
  );
}

function EmptyState({ tab }: { tab: PlanejarTab }) {
  if (tab === "anteriores") {
    return (
      <p className="mt-16 px-6 text-p16 leading-[1.2] text-muted-foreground">
        Suas viagens realizadas aparecerão aqui para você revisitar quando quiser.
      </p>
    );
  }
  return (
    <div className="mt-16 flex flex-col gap-10">
      <PlanejarBenefits />
      <p className="px-6 text-p16 leading-[1.2] text-muted-foreground">
        Toque em <span className="font-medium text-primary">nova viagem</span> para começar seu primeiro planejamento.
      </p>
    </div>
  );
}
