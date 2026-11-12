"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { ApiError, useTrip, useUpdateBudget } from "@/hooks/use-trips";
import { useTripItems } from "@/hooks/use-trip-items";
import { CATEGORY_MENU, formatMoney, parseMoney, type TripItemDTO } from "@/lib/trip-items";
import type { TripDTO } from "@/lib/trips";

/* eslint-disable @next/next/no-img-element */

/**
 * Estimar Gastos — Figma 2735:2980 (sem valor) · 3359:4320 (com valor e saldo).
 * Um card por categoria do "Novo Item": topo azul com o total, embaixo os itens com custo
 * ou "Adicionar itens" (volta à Tela da Viagem com o formulário daquela categoria aberto).
 */
export function GastosScreen({ initialTrip, initialItems }: { initialTrip: TripDTO; initialItems: TripItemDTO[] }) {
  const { data: trip = initialTrip } = useTrip(initialTrip.id, initialTrip);
  const { data: items = initialItems } = useTripItems(initialTrip.id, initialItems);
  const [editing, setEditing] = useState(false);

  const total = items.reduce((sum, i) => sum + Number(i.cost ?? 0), 0);
  const planned = trip.plannedBudget !== null ? Number(trip.plannedBudget) : null;
  const balance = planned !== null ? planned - total : null;

  return (
    // pb-16: no Figma, 64px entre o último card e o fim da tela (aqui, o topo da tab bar)
    <main className="flex flex-1 flex-col px-6 pt-16 pb-16">
      <Link href={`/app/viagens/${trip.id}`} aria-label="Voltar para a viagem" className="self-start">
        <img src="/icons/back.svg" alt="" width={24} height={24} />
      </Link>

      <h1 className="mt-6 text-h1 leading-[normal] font-semibold tracking-[-0.05em] text-foreground">Estimar Gastos</h1>
      <p className="mt-4 text-p16 leading-[1.2] text-muted-foreground">
        Defina o valor que deseja gastar no período de viagem e saiba quanto ainda possui para realizar sua viagem
      </p>

      {/* Valor Total Planejado · Saldo */}
      <dl className="mt-6 flex flex-col gap-2 text-p16 leading-[1.2] font-medium">
        <div className="flex items-center justify-between">
          <dt className="text-foreground">Valor Total Planejado</dt>
          <dd>
            <button type="button" onClick={() => setEditing(true)} className="text-primary" aria-label={planned === null ? "Preencher valor planejado" : "Alterar valor planejado"}>
              {planned === null ? "Preencher" : formatMoney(planned)}
            </button>
          </dd>
        </div>
        {balance !== null && (
          <div className="flex items-center justify-between">
            <dt className="text-foreground">Saldo</dt>
            <dd className={cn(balance < 0 ? "text-destructive" : "text-primary")}>{formatMoney(balance)}</dd>
          </div>
        )}
      </dl>

      <ul className="mt-7 flex flex-col gap-6">
        {CATEGORY_MENU.map(({ category, label }) => {
          const list = items.filter((i) => i.category === category);
          const sum = list.reduce((s, i) => s + Number(i.cost ?? 0), 0);
          return (
            <li key={category} className="overflow-hidden rounded-[12px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)]">
              {/* "Fundo cima": azul, 40px */}
              <div className="flex h-10 items-center bg-primary pr-4 pl-3 text-p14 leading-[1.2] text-white">
                <img src={`/icons/itens/white/cat-${category.toLowerCase().replace(/_/g, "-")}.svg`} alt="" width={24} height={24} />
                <span className="ml-2 flex-1">{label}</span>
                {sum > 0 && <span>{formatMoney(sum)}</span>}
              </div>
              {/* "Fundo abaixo": itens ou "Adicionar itens" */}
              <div className="flex flex-col gap-2 bg-white pt-3 pr-4 pb-[11px] pl-3 text-p14 leading-[1.2]">
                {list.length === 0 ? (
                  <Link href={`/app/viagens/${trip.id}?novo=${category}`} className="self-start font-medium text-primary">
                    Adicionar itens
                  </Link>
                ) : (
                  list.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 text-muted-foreground">
                      <span className="truncate">{item.title}</span>
                      <span className="shrink-0">{item.cost ? formatMoney(item.cost) : "—"}</span>
                    </div>
                  ))
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <BudgetSheet trip={trip} open={editing} onOpenChange={setEditing} />
    </main>
  );
}

/** "Preencher": valor total que a pessoa deseja gastar. */
function BudgetSheet({ trip, open, onOpenChange }: { trip: TripDTO; open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>{open && <BudgetForm trip={trip} onDone={() => onOpenChange(false)} />}</DrawerContent>
    </Drawer>
  );
}

function BudgetForm({ trip, onDone }: { trip: TripDTO; onDone: () => void }) {
  const [value, setValue] = useState(trip.plannedBudget ? formatMoney(trip.plannedBudget) : "");
  const [error, setError] = useState("");
  const update = useUpdateBudget(trip.id);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseMoney(value);
    if (n === undefined || Number.isNaN(n) || n < 0) return setError("Informe um valor válido");
    try {
      await update.mutateAsync(n);
      toast.success("Valor planejado salvo");
      onDone();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Não foi possível salvar o valor.");
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col px-6 pt-[31px] pb-8">
      <DrawerTitle className="text-h5 leading-[1.2] font-medium text-foreground">Valor Total Planejado</DrawerTitle>
      <DrawerDescription className="mt-2 text-p16 leading-[1.2] text-muted-foreground">
        Quanto você deseja gastar nesta viagem?
      </DrawerDescription>
      <Input
        className="mt-8"
        aria-label="Valor Total Planejado"
        placeholder="Valor"
        inputMode="decimal"
        autoFocus
        value={value}
        aria-invalid={!!error}
        onChange={(e) => {
          setValue(e.target.value);
          setError("");
        }}
        onBlur={() => {
          const n = parseMoney(value);
          if (n !== undefined && !Number.isNaN(n)) setValue(formatMoney(n));
        }}
      />
      {error && <p className="mt-1 text-small text-destructive">{error}</p>}
      <Button type="submit" size="cta" disabled={update.isPending} className="mt-[47px]">
        {update.isPending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
