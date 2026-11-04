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

## Estrutura
```
app/(public)/      landing, login, pricing
app/(auth)/        área logada: /app (Home, Planejar, Buscar, Conta) e /settings/billing
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
