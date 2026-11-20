"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/initials";
import { APP_VERSION, SUPPORT_EMAIL } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";

/* eslint-disable @next/next/no-img-element */

export type ContaUser = { name: string | null; email: string; image: string | null };
export type ContaPlan = { title: string; detail: string };

/**
 * Conta — Figma "Conta (pré-login)" (4986:6153) e "Conta (logado)" (4986:6227).
 * Privacidade e dados (LGPD, art. 18): baixar uma cópia dos dados, corrigir o nome, excluir a conta
 * no próprio app e chegar à Política de Privacidade com ou sem login.
 */
export function ContaScreen({
  user,
  plan,
  tripsCount = 0,
  hasSubscription = false,
  logout,
}: {
  user: ContaUser | null;
  plan?: ContaPlan;
  tripsCount?: number;
  hasSubscription?: boolean;
  logout?: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <main className="flex flex-1 flex-col px-6 pt-6 pb-8">
      <h1 className="text-h1 leading-[normal] font-semibold text-foreground">Conta</h1>

      {!user ? (
        <>
          <p className="mt-2 text-p16 leading-[18px] text-muted-foreground">
            Entre para salvar suas viagens e acessá-las de qualquer aparelho.
          </p>
          <Button asChild size="cta" className="mt-8">
            <Link href="/login?callbackUrl=/app/conta">Entrar</Link>
          </Button>
          <Section title="Ajuda e informações">
            <InfoRows />
          </Section>
        </>
      ) : (
        <>
          {/* Perfil: confirma de cara com qual conta a pessoa está */}
          <div className="mt-8 flex items-center gap-4">
            <Avatar user={user} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate text-h5 leading-[1.2] font-medium text-foreground">{user.name ?? "Viajante"}</p>
              <p className="truncate text-p14 leading-[1.2] text-muted-foreground">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Editar perfil"
              // Área de toque de 44px em volta do ícone de 24px
              className="relative shrink-0 rounded-[4px] outline-none before:absolute before:-inset-[10px] focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <img src="/icons/edit.svg" alt="" width={24} height={24} />
            </button>
          </div>

          {plan && (
            <Section title="Seu plano">
              <Link
                href="/settings/billing"
                className="flex items-center gap-4 rounded-[12px] bg-white p-4 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <img src="/icons/conta/premium.svg" alt="" width={24} height={24} />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-p16 leading-[1.2] font-medium text-foreground">{plan.title}</span>
                  <span className="text-p14 leading-[1.2] text-muted-foreground">{plan.detail}</span>
                </span>
                <span className="text-p16 leading-[1.2] font-medium text-primary">Gerenciar</span>
              </Link>
            </Section>
          )}

          <Section title="Privacidade e dados" description="Veja, baixe ou apague os dados que o Tripper guarda sobre você.">
            <ul className="flex flex-col divide-y divide-tripper-divider">
              <li>
                <Row as="a" href="/api/account/export" download icon="/icons/conta/download.svg" label="Baixar meus dados" />
              </li>
              <li>
                <Row href="/privacidade" icon="/icons/conta/policy.svg" label="Política de privacidade" />
              </li>
              <li>
                <Row href="/termos" icon="/icons/conta/description.svg" label="Termos de uso" />
              </li>
              <li>
                <Row onClick={() => setDeleting(true)} icon="/icons/delete-red.svg" label="Excluir conta" danger />
              </li>
            </ul>
          </Section>

          <Section title="Ajuda">
            <ul className="flex flex-col divide-y divide-tripper-divider">
              <ContactRows />
            </ul>
          </Section>

          {logout && (
            <form action={logout} className="mt-12">
              <Button type="submit" variant="outline" size="cta">
                Sair da conta
              </Button>
            </form>
          )}

          <EditProfileSheet open={editing} onOpenChange={setEditing} user={user} />
          <DeleteAccountSheet
            open={deleting}
            onOpenChange={setDeleting}
            tripsCount={tripsCount}
            hasSubscription={hasSubscription}
          />
        </>
      )}

      <p className="mt-8 text-center text-small leading-[1.2] text-tripper-dark-300">Tripper · versão {APP_VERSION}</p>
    </main>
  );
}

/** Título de seção 24px Medium (como "O que a viagem vai ter"), descrição opcional e lista 16px abaixo. */
function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="mt-8 flex flex-col">
      <h2 className="text-h3 leading-[1.2] font-medium tracking-[-0.03em] text-foreground">{title}</h2>
      {description && <p className="mt-2 text-p16 leading-[18px] text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function InfoRows() {
  return (
    <ul className="flex flex-col divide-y divide-tripper-divider">
      <li>
        <Row href="/privacidade" icon="/icons/conta/policy.svg" label="Política de privacidade" />
      </li>
      <li>
        <Row href="/termos" icon="/icons/conta/description.svg" label="Termos de uso" />
      </li>
      <ContactRows />
    </ul>
  );
}

function ContactRows() {
  return (
    <>
      <li>
        <Row as="a" href={`mailto:${SUPPORT_EMAIL}`} icon="/icons/conta/mail.svg" label="Fale conosco" />
      </li>
      <li>
        <Row href="/sobre" icon="/icons/conta/info.svg" label="Sobre o Tripper" />
      </li>
    </>
  );
}

/** Linha de lista de 56px: ícone 24, rótulo 16 Medium e seta. Ação destrutiva em vermelho e sem seta. */
function Row({
  as,
  href,
  download,
  onClick,
  icon,
  label,
  danger,
}: {
  as?: "a";
  href?: string;
  download?: boolean;
  onClick?: () => void;
  icon: string;
  label: string;
  danger?: boolean;
}) {
  const className = cn(
    "flex h-14 w-full items-center gap-4 text-left text-p16 leading-[1.2] font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    danger ? "text-destructive" : "text-foreground",
  );
  const content = (
    <>
      <img src={icon} alt="" width={24} height={24} />
      <span className="flex-1">{label}</span>
      {!danger && <img src="/icons/conta/chevron-right.svg" alt="" width={24} height={24} />}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }
  if (as === "a") {
    return (
      <a href={href} download={download || undefined} className={className}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href!} className={className}>
      {content}
    </Link>
  );
}

function Avatar({ user }: { user: ContaUser }) {
  const letters = initials(user.name);
  if (user.image) return <img src={user.image} alt="" width={64} height={64} className="size-16 shrink-0 rounded-full object-cover" />;
  return (
    <span aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-h4 font-semibold text-white">
      {letters || <img src="/icons/account-white.svg" alt="" width={32} height={32} />}
    </span>
  );
}

/** "Editar perfil" (Figma 4986:6342): corrige o nome. O e-mail é o acesso ao app; troca pelo suporte. */
function EditProfileSheet({ open, onOpenChange, user }: { open: boolean; onOpenChange: (o: boolean) => void; user: ContaUser }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>{open && <EditProfileForm user={user} onDone={() => onOpenChange(false)} />}</DrawerContent>
    </Drawer>
  );
}

function EditProfileForm({ user, onDone }: { user: ContaUser; onDone: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return setError(body.error ?? "Não foi possível salvar o nome.");
      toast.success("Nome atualizado");
      router.refresh();
      onDone();
    } catch {
      toast.error("Não foi possível salvar o nome. Verifique sua conexão.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col px-6 pt-[31px] pb-8">
      <DrawerTitle className="text-h5 leading-[1.2] font-medium text-foreground">Editar perfil</DrawerTitle>
      <DrawerDescription className="sr-only">Altere o nome que aparece no app.</DrawerDescription>
      <label htmlFor="conta-nome" className="mt-6 text-p14 leading-[1.2] text-muted-foreground">
        Nome
      </label>
      <Input
        id="conta-nome"
        className="mt-2"
        autoComplete="name"
        value={name}
        aria-invalid={!!error}
        aria-describedby={error ? "conta-nome-erro" : undefined}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
      />
      {error && (
        <p id="conta-nome-erro" className="mt-1 text-small text-destructive">
          {error}
        </p>
      )}
      <p className="mt-6 text-p14 leading-[1.2] text-muted-foreground">E-mail</p>
      <p className="mt-2 text-p16 leading-[1.2] break-all text-tripper-dark-300">{user.email}</p>
      <p className="mt-2 text-p14 leading-[18px] text-muted-foreground">
        O e-mail é o seu acesso ao Tripper. Para trocá-lo,{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary">
          fale com a gente
        </a>
        .
      </p>
      <Button type="submit" size="cta" disabled={pending} className="mt-10">
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}

/** "Excluir conta?" (Figma 4986:6366) — mesmo padrão do "Excluir viagem": diz o que se perde e oferece a cópia. */
function DeleteAccountSheet({
  open,
  onOpenChange,
  tripsCount,
  hasSubscription,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tripsCount: number;
  hasSubscription: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const trips =
    tripsCount === 0
      ? "Os dados do seu perfil serão apagados."
      : tripsCount === 1
        ? "Sua viagem, com os itens do roteiro e o valor planejado, e os dados do seu perfil serão apagados."
        : `Suas ${tripsCount} viagens, com os itens do roteiro e os valores planejados, e os dados do seu perfil serão apagados.`;

  async function confirm() {
    setPending(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Não foi possível excluir a conta. Tente de novo.");
        return setPending(false);
      }
      queryClient.clear(); // nada da conta apagada fica em memória
      onOpenChange(false);
      toast.success("Sua conta foi excluída.");
      router.replace("/app");
      router.refresh();
    } catch {
      toast.error("Não foi possível excluir a conta. Verifique sua conexão.");
      setPending(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="flex flex-col px-6 pt-[31px] pb-6">
          <DrawerTitle className="text-h5 leading-[1.2] font-medium text-foreground">Excluir conta?</DrawerTitle>
          <DrawerDescription className="mt-2 text-p16 leading-[1.2] text-muted-foreground">
            {trips} {hasSubscription && "Sua assinatura também será cancelada. "}Não é possível desfazer.
          </DrawerDescription>
          <p className="mt-4 text-p16 leading-[1.2] text-muted-foreground">
            Quer guardar uma cópia?{" "}
            <a href="/api/account/export" download className="font-medium text-primary">
              Baixar meus dados
            </a>
          </p>
          <Button
            size="cta"
            disabled={pending}
            onClick={confirm}
            className="mt-8 bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80"
          >
            {pending ? "Excluindo..." : "Excluir conta"}
          </Button>
          <Button variant="ghost" size="cta" onClick={() => onOpenChange(false)} className="mt-2 text-foreground">
            Cancelar
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
