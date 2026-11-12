"use client";

import { useState, type ComponentProps } from "react";
import { HomeCard } from "@/components/home/home-card";
import { TripFormSheet } from "@/components/planejar/trip-form-sheet";
import { useNewTripSubmit } from "@/hooks/use-new-trip";

/**
 * Card "Planeje uma nova viagem" da Home: abre o bottom sheet Nova Viagem sobre a própria
 * Home (protótipo "Nova Viagem (pré-login)"), com ou sem login.
 */
export function NewTripCard(props: Omit<ComponentProps<typeof HomeCard>, "href" | "onClick">) {
  const [open, setOpen] = useState(false);
  const { submit, pending } = useNewTripSubmit();

  return (
    <>
      <HomeCard {...props} onClick={() => setOpen(true)} />
      <TripFormSheet open={open} onOpenChange={setOpen} pending={pending} onSubmit={submit} />
    </>
  );
}
