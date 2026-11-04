"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

async function postForUrl(path: string) {
  const res = await fetch(path, { method: "POST" });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error ?? "Não foi possível continuar");
  return data.url as string;
}

export function BillingActions({ subscribed, hasCustomer }: { subscribed: boolean; hasCustomer: boolean }) {
  const params = useSearchParams();

  useEffect(() => {
    const status = params.get("status");
    if (status === "success") toast.success("Assinatura confirmada! Bem-vindo ao Tripper PRO.");
    if (status === "cancelled") toast("Checkout cancelado.");
  }, [params]);

  const redirect = useMutation({
    mutationFn: postForUrl,
    onSuccess: (url) => { window.location.href = url; },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="flex flex-col gap-3">
      {!subscribed && (
        <Button size="cta" disabled={redirect.isPending} onClick={() => redirect.mutate("/api/stripe/checkout")}>
          Fazer upgrade
        </Button>
      )}
      {hasCustomer && (
        <Button size="cta" variant="outline" disabled={redirect.isPending} onClick={() => redirect.mutate("/api/stripe/portal")}>
          Gerenciar assinatura
        </Button>
      )}
    </div>
  );
}
