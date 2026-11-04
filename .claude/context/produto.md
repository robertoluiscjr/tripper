# Tripper — Contexto de produto (fonte: artigo no Medium + artefatos)

> Artigo: "Tripper — Solução em UX para o planejamento completo de viagens", Roberto Luís Coelho (maio/2026).
> Programa UX Unicórnio — tema "Roteiros de Viagens sem complicação".
> Equipe na fase de estratégia/pesquisa: Roberto Luís Coelho, Juliana Rocha e Zilda Borges. Rabiscoframes em diante: Roberto.

## [MEU PRODUTO] (seção do BOILERPLATE_MANUAL preenchida)

```
Nome do produto: Tripper
Headline: "Planeje sua próxima viagem e tenha uma experiência inesquecível"
Subtítulo: "Elabore um roteiro personalizado, estime os gastos da viagem e acompanhe a evolução do seu planejamento."

Features:
1. Planejamento passo a passo da viagem (Nova Viagem → roteiro por dia) com barra de progresso (Ver Progresso)
2. Roteiro personalizado em linha do tempo, com itens arrastáveis entre os dias e mapa dos pontos de interesse
3. Estimar Gastos (planejamento financeiro): orçamento desejado x gasto por categoria, saldo atualizado
4. Itens do roteiro: Transportes (avião, ônibus, trem, navio, carro próprio), Acomodações, Passeios e Atrações,
   Comer e Beber, Aluguel de Carro, Atividades Personalizadas
5. Buscar: passagens, hospedagens, passeios/atrações e pacotes, com compra integrada que alimenta o roteiro

Entidades extras (além de User, Account, Session): Trip, TripItem, Destination, Tour, Booking (ver prisma/schema.prisma)

Limites por plano (PROVISÓRIOS — monetização a definir, ver lib/plans.ts):
- FREE: 1 viagem ativa, 15 itens por viagem
- TRIAL (14 dias): tudo ilimitado
- PRO: tudo ilimitado

Preço:
- PRO: R$ 14,90/mês (provisório)

Cores:
- Primária: #2765C2
- Fundo: #FFFFFF
- Acento: #FF8A00
```

## Problema e objetivo
- Pergunta do desafio: como ajudar pessoas que nunca viajaram para um novo lugar a planejar seu roteiro e ter sempre à mão as informações de hotéis, passagens, tickets e ingressos.
- Cenário: alta adoção digital e preferência massiva por mobile no Brasil, mas o planejamento segue **fragmentado** (buscadores de passagens, sites de hospedagem, mapas, redes sociais, anotações pessoais) → fricção e insegurança.
- Objetivo: solução digital que **centraliza e organiza** planejamento + compras de viagem em um único espaço, guiando o usuário "do sonho à compra" e auxiliando também durante a viagem. Valores: fluidez, clareza e confiança.

## Usuários e personas (validadas)
1. **Ana Oliveira Medeiros — "a planejadora"** · 35 anos · administradora · casada · organiza as próprias viagens.
   - Citação: "Eu acho que tendo mais tempo você planeja passo a passo, para não ficar se sentindo perdida!"
   - Vida corrida (pequena empresa); viajar = relaxar com marido e amigos; valoriza planejar bem e montar o roteiro; resolve tudo digitalmente.
   - Dores: pouco tempo para planejar; não sabe por onde começar o roteiro; imprevistos em viagens anteriores; agrupar pontos de interesse nos mesmos dias; estimar gastos; insistência de agentes de viagem; precisa planejar colaborativamente.
   - Soluções: reduzir o tempo de planejamento; roteiro guiado passo a passo; plano reserva para situações adversas; pontos de interesse no mapa; controle de custos estimados; liberdade para pesquisar/comprar; planejamento colaborativo em tempo real.
2. **Rafael Gonçalves Borba — "o pragmático"** · 28 anos · publicitário (marketing digital) · solteiro · viaja usando pacotes.
   - Citação: "Eu sempre pesquiso no site individual de cada empresa, mas pesquiso também diferentes pacotes até achar uma data que se encaixe com o valor ideal."
   - Valoriza praticidade/comodidade; compra online; apaixonado por fotografia e novas culturas.
   - Dores: pesquisar em vários sites para comparar preços/datas; acha planejar trabalhoso; costuma gastar mais que o previsto.
   - Soluções: centralizar pesquisas com ofertas personalizadas em espaço único e seguro; montar o planejamento a partir das compras feitas no app (novo plano ou plano existente); sincronizar e-mail para planejamento automático; estimativa de gastos ajustável durante a viagem.

## Jornadas (resumo das oportunidades)
- **Ana** (pré-viagem 3 meses · durante 1 semana · pós 1 semana). Emoção: neutra/baixa no pré-viagem (insegurança, medo de más escolhas), positiva durante e após.
  - Pré: passo a passo com barra de progresso; pontos de interesse no mapa; estimar todos os gastos; compartilhar o planejamento; sugestões de passagens/hospedagens/passeios conforme o destino buscado.
  - Durante: lembrete da próxima atividade; adaptar o roteiro facilmente; plano alternativo (chuva, mar revolto); suporte ao viajante; informações de voo (horários, portões, status).
  - Pós: indicar destinos semelhantes; promoções; avaliações e depoimentos curtos; recompensas por feedback.
- **Rafael** (pré 1 mês · durante 5 dias · pós 1 semana).
  - Pré: centralizar informações de forma prática e segura; personalizar pacotes (upgrade de acomodação, passeios extras); comparar pacote x itens avulsos; avaliações de quem já viajou.
  - Durante: visualização objetiva das informações; estimativa de gastos atualizada (alertas e status); informações úteis dos passeios (horários, origem, história).
  - Pós: compartilhar histórias; sugestões de melhoria do pacote; espaço para a melhor foto da viagem.

## Matriz CSD (destaques)
- Certezas: agências físicas têm pequena fatia das vendas; compras migraram para o digital (acelerado pela pandemia); maioria prefere pesquisar e comprar pelo smartphone; turismo ≈ US$ 167,6 bi no PIB (2025), +8 mi empregos.
- Suposições: pacotes são mais caros e engessados; montar o próprio roteiro reduz gastos e dá liberdade; quem planeja sente satisfação; dificuldade em organizar documentos; roteiros feitos em ferramentas não criadas para isso (planilhas, textos).
- Dúvidas: quem prefere planejar? como reduzir o tempo de planejamento? o que fazem quando não conseguem planejar? organizar documentos é difícil? como economizam? o que entendem por "roteiro"?

## Pesquisa quantitativa (2 surveys: 104 respostas; depois 137 → 111 válidas)
- 72,2% viajaram ao menos 2x no ano (18–45 anos). 57,7% montaram o próprio roteiro (84,2% entre quem viaja 4x+; 75% em viagens a trabalho).
- 26% montaram roteiro em Google Docs/Word/Excel/Bloco de Notas; 81,5% (18–35 anos) usam algum grau de tecnologia no roteiro.
- Apenas 2,9% já usaram app de planejamento para montar roteiro; 9,6% usam app para armazenar dados; **80,8% nunca usaram app de planejamento** → oportunidade.
- 84,6% guardam dados da viagem em e-mail/WhatsApp. 88% compraram passagem online; 94,3% reservaram hospedagem online.
- Destinos: estado de outra região 41,4%, cidade no mesmo estado 29,7%, estado da mesma região 28,8%. Transporte: avião 42,3%, carro 33,3%, ônibus 21,6%. Finalidade: lazer 73,9%, trabalho 10,8%.
- Nuvem de palavras (maior dificuldade): **tempo, roteiro, financeiro, planejamento, preços, datas, passagem, dinheiro**.

## Pesquisa qualitativa (12 entrevistas: 9 planejam sozinhos, 3 usam agências)
- Planejar é essencial para aproveitar o tempo e caber no orçamento; falta de planejamento gera imprevistos e arrependimento. Alguns desistem de viajar sem tempo para planejar; outros compram pacote.
- Passeios alternativos para mudanças de clima são desejados. Avião é o principal transporte. **Mapa é essencial** para agrupar pontos de interesse próximos no mesmo dia.
- Buscam inspiração em blogs, Instagram e YouTube. Orçamento com estimativa de gastos é necessário. Comprar digital dá liberdade e evita insistência de agências. Avaliações ajudam a decidir.
- Ordem mais comum de compra: **passagem → hospedagem**. Passeios muitas vezes comprados em agências locais no destino. Usam vários canais (WhatsApp, Instagram, apps) e monitoram preços/alertas.
- "Roteiro" é subjetivo: alguns só listam o que querem conhecer; outros fazem cronograma detalhado com dias e horários.
- Armazenamento de documentos não é dificuldade (digital, poucos imprimem; alguns querem alternativa offline).
- Falas: "Fazer o planejamento e definir roteiro, pra mim, é terapêutico." · "O Google Maps é o que salva nessas horas…"

## Priorização — Matriz Impacto x Esforço
**MVP (alto impacto / baixo-médio esforço):**
1. Passo a passo para facilitar o planejamento via **barra de progresso**
2. **Estimar os gastos** da viagem (planejamento financeiro)
3. **Mapa** para visualizar os pontos de interesse do roteiro
4. Elaborar **roteiro personalizado**, permitindo adaptações
5. Oferecer opções de **passagens, hospedagens, passeios e pacotes**

Alto impacto / alto esforço (futuro): plano alternativo para situações adversas; criação colaborativa; área de avaliações.
Baixo impacto: notificações das atividades; acesso às informações de voo; promoções; espaço para foto da viagem; recompensas por feedback; destinos semelhantes.

## Testes de usabilidade → requisitos de UI
1º teste (baixa fidelidade, 5 usuários): recuperação de senha no login; textos de login/cadastro em 1ª pessoa; texto em todos os dias do período ("Adicione itens neste dia"); campos de texto ocupando a largura até a margem.
2º teste (média fidelidade): criar onboarding; campo de confirmação de e-mail no cadastro; Home com saudação (ou login) e principais funcionalidades; **CTAs e campos com dimensão padronizada**; **dropdown** de meio de transporte (5 opções); **arrastar e soltar** itens do roteiro entre os dias; texto explicativo em Estimar Gastos.
3º teste (alta fidelidade): onboarding e nova Home aprovados (Home na tab bar). Pedidos: compartilhar a viagem com outros participantes (ver/editar) e lembretes das atividades.

## Métricas a instrumentar
Downloads; avaliações; retenção; **taxa de conclusão do planejamento**; **tempo médio de planejamento**; taxa de conversão; usuários ativos; taxa de abandono. Revisão mensal (sem baseline).

## Roadmap pós-MVP
- Planejamento colaborativo em tempo real (ver/editar)
- Plano alternativo para situações adversas (chuva, vento, mar revolto)
- Sincronização com e-mail para alimentar o roteiro com voos/reservas/passeios
- Lembretes/notificações das atividades do roteiro
