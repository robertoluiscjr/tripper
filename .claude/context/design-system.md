# Tripper — Design system e mapa do Figma

Figma: https://www.figma.com/design/CbQ3wMw0QDnh2vlwOHmsUF/Alta-fidelidade-Tripper (fileKey `CbQ3wMw0QDnh2vlwOHmsUF`)
Páginas: `0:1` Protótipo · `316:1745` Components. Frames mobile 393 × 852.
Use o Figma MCP (`get_design_context` / `get_screenshot`) com os node IDs abaixo ao implementar cada tela.

## Identidade
Nome: trip (viagem) + -er (o viajante). Logo: wordmark "tripper" com pássaro laranja (liberdade, movimento, descoberta).
Tom: moderno, amigável, leve. Textos de login/cadastro em 1ª pessoa.

## Cores (tokens em app/globals.css)
| Grupo | Hex | Token Tailwind |
|---|---|---|
| Primária (Active) | #3D7EDF | `tripper-blue-300` / `primary-active` |
| Primária | #2765C2 | `tripper-blue-500` / `primary` |
| Primária (Hover) | #114697 | `tripper-blue-700` / `primary-hover` |
| Secundária clara | #FFE4C5 | `tripper-orange-100` / `accent` |
| Secundária | #FF8A00 | `tripper-orange-500` / `secondary` |
| Secundária escura | #FF6A00 | `tripper-orange-700` |
| Sucesso | #60C86C | `success` |
| Erro | #D14142 | `destructive` |
| Alerta | #F2D266 | `warning` |
| Dark | #B9B9B9 · #696969 · #454545 | `tripper-dark-300/500/700` |
| Light | #FFFFFF · #F0F0F0 · #E5E5E5 | `tripper-light-100/300/500` |

## Tipografia — Jost (next/font, variável `--font-jost`)
| Estilo | Tamanho | Peso | Classe |
|---|---|---|---|
| H1 | 32 | SemiBold | `text-h1 font-semibold` |
| H2 | 28 | SemiBold | `text-h2 font-semibold` |
| H3 | 24 | Medium | `text-h3 font-medium` |
| H4 | 22 | SemiBold | `text-h4 font-semibold` |
| H5 | 20 | Medium | `text-h5 font-medium` |
| H6 | 18 | Medium | `text-h6 font-medium` |
| P | 16 | Medium/Regular | `text-p16` |
| P | 15 | Medium/Regular | `text-p15` |
| P | 14 | SemiBold/Medium/Regular | `text-p14` |
| P / Small | 12 | SemiBold/Regular | `text-small` |

## Botões (components/ui/button.tsx)
- Bordas totalmente arredondadas (pill).
- Primário: `variant="default"` — Primary #2765C2, Hover #114697, Active #3D7EDF, Disabled cinza.
- Secundário: `variant="outline"` — contorno azul, mesmos estados.
- CTA de tela: `size="cta"` (h-12, largura total) — mesma dimensão em todas as telas.
- FAB "+" (adicionar item): `size="fab"`.
- Navegação (tab bar): Home, Buscar, Planejar, Conta — ícone + label; ativo em azul.
- Outros: links de texto azul ("Preencher", "Adicionar itens", "Cadastrar", "Esqueci minha senha", "Mostrar mais", "Ler mais") e ações com ícone ("Estimar Gastos", "Ver Progresso").

## Formulários
Estados visuais claros (default, foco, preenchido, erro, desabilitado). Campos ocupam a largura total até a margem. Placeholders no padrão "Digite seu melhor e-mail".

## Mapa de telas (página Protótipo `0:1`)
| Fluxo | Tela | Node |
|---|---|---|
| Entrada | Splash Screen (início do protótipo) | 2226:2204 |
| | Onboarding 1 / 2 / 3 | 3195:3347 · 2626:2687 · 3141:3255 |
| | Home (pré-login) | 2209:2508 |
| | Home (logado) | 3359:5394 |
| Conta | Planejar (pré-login) | 3622:4431 |
| | Login · Login 2 | 3544:3125 · 3544:3099 |
| | Cadastro · Cadastro 2 | 3544:3076 · 3544:3053 |
| Planejar | Planejar (Próximas / Anteriores) | 214:2250 |
| | Nova Viagem · Nova Viagem 2 | 3463:2970 · 2139:1794 |
| | Tela da Viagem (1 a 4) | 180:687 · 2098:2018 · 2109:1868 · 3821:4522 |
| | Novo Item · Novo Item 2 | 3484:3490 · 195:759 |
| | Transportes · Transportes 2 (dropdown) | 192:316 · 2062:1662 |
| | Voo · Voo 2 | 195:532 · 2156:1881 |
| | Acomodação · Acomodação 2 | 195:828 · 2162:1969 |
| | Estimar Gastos (1 a 4) | 2735:2980 · 3359:4320 · 4702:5295 · 4702:5272 |
| | Progresso da viagem | 4688:5461 |
| Buscar/Comprar | Buscar | 214:2332 |
| | Passeios e Atrações | 247:1328 |
| | Destino Pesquisado | 272:1307 |
| | Descrição do Passeio | 3806:4707 |
| | Seus Dados · Seus Dados 2 | 285:1485 · 2718:2680 |
| | Dados de Pagamento · 2 | 294:1438 · 2718:2743 |
| | Adicionar Compra (adicionar à viagem) | 296:1732 |

Linhas com y < −2000 no canvas são variações dos fluxos de Buscar/Login/Cadastro (ex.: compra sem login).
