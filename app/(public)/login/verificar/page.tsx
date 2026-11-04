import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Verifique seu e-mail" };

export default function VerifyRequestPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <MailCheck className="size-14 text-primary" />
      <h1 className="text-h4 font-semibold text-foreground">Confira seu e-mail</h1>
      <p className="text-p15 text-muted-foreground">
        Enviamos um link de acesso para você. Clique nele para entrar no Tripper.
      </p>
      <Button asChild variant="outline" size="cta">
        <Link href="/login">Voltar</Link>
      </Button>
    </main>
  );
}
