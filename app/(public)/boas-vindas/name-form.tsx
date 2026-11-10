"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveName, type SaveNameState } from "./actions";

export function NameForm({ defaultName, next, editing }: { defaultName: string; next: string; editing: boolean }) {
  const [state, action, pending] = useActionState<SaveNameState, FormData>(saveName, {});

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Seu nome</Label>
        <Input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={60}
          autoComplete="name"
          autoFocus
          defaultValue={state.name ?? defaultName}
          placeholder="Ex.: Ana Medeiros"
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "name-error" : undefined}
          className="h-12 rounded-xl"
        />
        {state.error && (
          <p id="name-error" role="alert" className="text-small text-destructive">
            {state.error}
          </p>
        )}
      </div>

      <Button type="submit" size="cta" disabled={pending}>
        {pending ? "Salvando…" : editing ? "Salvar" : "Continuar"}
      </Button>

      <Link href={next} className="text-center text-p14 text-muted-foreground underline-offset-4 hover:underline">
        {editing ? "Cancelar" : "Agora não"}
      </Link>
    </form>
  );
}
