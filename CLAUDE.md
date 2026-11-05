@AGENTS.md

# Tripper — convenções do projeto

App de planejamento completo de viagens (case de portfólio UX/UI → produto funcional).
Contexto de produto: `.claude/context/produto.md` · Design system + mapa do Figma: `.claude/context/design-system.md`
Manual do boilerplate seguido: `docs/BOILERPLATE_MANUAL.md`.

## Stack
Next.js 16 (App Router, Cache Components, Turbopack) · TypeScript strict · Tailwind CSS 4 · shadcn/ui (radix-nova) ·
TanStack Query · Prisma 6 + PostgreSQL (Neon) · Zod 4 · Auth.js v5 (Google + magic link Resend) · Stripe · Resend · Sonner.

## Regras
- **Mobile-first**: o design é de app mobile (393 × 852). Telas logadas usam `max-w-md mx-auto`.
- **Português (pt-BR)** em toda a UI, mensagens de erro e textos. Código/identificadores em inglês.
- Use os tokens de `app/globals.css` (`bg-primary`, `text-secondary`, `text-h3`…); nunca hex solto em componentes.
- CTAs de tela: `<Button size="cta">`. Campos com largura total.
- **Next 16**: `middleware.ts` virou `proxy.ts`. Com `cacheComponents: true`, qualquer leitura de cookies/sessão/
  `searchParams`/`new Date()` precisa ficar dentro de `<Suspense>` (o layout `app/(auth)` já fornece o boundary).
  Não use `export const dynamic`/`revalidate`. Leia `node_modules/next/dist/docs/` antes de usar APIs novas.
- **Proxy leve**: nunca importar Auth.js, Prisma, Stripe ou Resend em `proxy.ts` (só checa o cookie).
- Validação com Zod em `lib/validations.ts`, compartilhada entre form e API route.
- API routes sempre checam `getCurrentUser()` e aplicam `checkUsageLimit()` onde houver limite de plano.
- Stripe e Resend com init preguiçoso (build funciona sem as chaves).
- Toasts: `sonner` (o toast do shadcn foi depreciado).
- Prisma 6 (não 7). Após mudar o schema: `npm run db:push` (dev) ou `npm run db:migrate`.
- Monetização ainda **provisória**: limites/preço em `lib/plans.ts`.
- **Fidelidade ao Figma**: use `get_design_context` com o node ID (tabela em `.claude/context/design-system.md`),
  baixe os assets para `public/` (fotos grandes → WebP com sharp) e reproduza o recorte das imagens do Figma.
  Conferir com print 393×852 (Edge headless dentro de um iframe de 393px).
- Componentes de layout: `MobileShell` (moldura mobile), `TabBar`, `Logo` (wordmark oficial, tamanho via font-size).

## Estrutura
```
app/(public)/      / (Splash), /onboarding, /login, /pricing, /sobre (landing)
app/(app)/         /app com tab bar: Home, Buscar, Planejar, Conta — acessível sem login (variações "pré-login")
app/(auth)/        exige login: /settings/billing (proxy também protege /app/viagens/*)
app/api/           auth, stripe (checkout, portal, webhook), trips
components/ui/     shadcn/ui customizado com o styleguide
components/layout/ logo, tab bar, headers
components/paywall/ PaywallGate, TrialBanner
lib/               auth, db, stripe, email, plans, subscription, session, validations
prisma/schema.prisma
```

## Comandos
`npm run dev` · `npm run build` · `npm run typecheck` · `npm run lint` · `npm run setup` (gera .env) ·
`npm run db:push` · `npm run db:studio` · `npm run stripe:listen`
