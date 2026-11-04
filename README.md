# ✈️ Tripper

**Planeje sua próxima viagem e tenha uma experiência inesquecível.**
O Tripper centraliza todo o planejamento da viagem — roteiro personalizado dia a dia, mapa dos pontos de interesse,
estimativa de gastos, progresso do planejamento e compra de passagens, hospedagens e passeios — em um só lugar.

Case de portfólio de UX/UI e Product Design (Programa UX Unicórnio) transformado em produto funcional.
- 📄 Estudo de caso: [Medium](https://medium.com/@robertoluiscoelho/tripper-solu%C3%A7%C3%A3o-em-ux-para-o-planejamento-completo-de-viagens-74a475a21a27)
- 🎨 Design: [Figma — Alta fidelidade](https://www.figma.com/design/CbQ3wMw0QDnh2vlwOHmsUF/Alta-fidelidade-Tripper)

## Stack
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · TanStack Query · Prisma 6 + PostgreSQL (Neon) ·
Zod · Auth.js v5 · Stripe · Resend · Vercel

## Pré-requisitos
Node.js 18+ (testado com v26), npm, Git, GitHub CLI (`gh`), Vercel CLI (`npm i -g vercel`).
Contas: GitHub, Vercel, Neon, Google Cloud Console, Resend, Stripe (modo teste).

## Setup local
```bash
npm install
npm run setup        # pergunta cada variável e grava o .env (AUTH_SECRET é gerado)
npm run db:push      # cria as tabelas no Neon
npm run dev          # http://localhost:3000
```

### Onde obter cada variável
| Variável | Onde |
|---|---|
| `DATABASE_URL` | Neon → projeto → Connection string (pooled) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google Cloud Console → Credentials → OAuth Client (Web). Redirect URI: `http://localhost:3000/api/auth/callback/google` e `https://SEU-APP.vercel.app/api/auth/callback/google` |
| `AUTH_RESEND_KEY` / `RESEND_API_KEY` | Resend → API Keys |
| `STRIPE_SECRET_KEY` | Stripe (modo teste) → Developers → API keys |
| `STRIPE_PRICE_ID_PRO` | Stripe → Product catalog → "Tripper PRO" → preço recorrente mensal |
| `STRIPE_WEBHOOK_SECRET` | Local: `npm run stripe:listen` · Produção: endpoint `https://SEU-APP.vercel.app/api/stripe/webhook` com os eventos `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted` |

## Deploy (Vercel)
```bash
vercel link
vercel env add DATABASE_URL     # repita para cada variável do .env.example
vercel --prod
```
Com o repositório conectado na Vercel, cada push na `main` gera um deploy automático.

## Scripts
| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | `prisma generate` + build de produção |
| `npm run typecheck` / `npm run lint` | Verificações |
| `npm run setup` | Configuração interativa do `.env` |
| `npm run db:push` / `db:migrate` / `db:studio` | Banco de dados |
| `npm run stripe:listen` | Encaminha webhooks do Stripe para o localhost |

## Planos (provisório)
TRIAL de 14 dias no primeiro login → depois FREE (limitado) ou PRO via Stripe. Ajuste em `lib/plans.ts`.

## Documentação para desenvolvimento
- `CLAUDE.md` — convenções do projeto
- `.claude/context/produto.md` — personas, jornadas, pesquisas, priorização e requisitos
- `.claude/context/design-system.md` — tokens, tipografia, botões e mapa das telas do Figma
- `docs/BOILERPLATE_MANUAL.md` — manual do boilerplate seguido
