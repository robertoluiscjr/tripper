import { z } from "zod";

/**
 * Schemas Zod compartilhados entre formulários (client) e API routes (server).
 * Mensagens em português, seguindo os estados de formulário do styleguide.
 */

const money = z.coerce
  .number({ message: "Informe um valor válido" })
  .min(0, "O valor não pode ser negativo")
  .optional();

// Tela "Nova Viagem": nome + (datas início/fim) OU (quantidade de dias)
export const createTripSchema = z
  .object({
    name: z.string().trim().min(2, "Dê um nome para a viagem").max(80),
    destination: z.string().trim().max(120).optional(),
    durationMode: z.enum(["dates", "days"]),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    daysCount: z.coerce.number().int().min(1).max(90).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.durationMode === "dates") {
      if (!data.startDate || !data.endDate) {
        ctx.addIssue({ code: "custom", path: ["startDate"], message: "Informe as datas inicial e final" });
      } else if (data.endDate < data.startDate) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "A data final deve ser depois da inicial" });
      } else if ((data.endDate.getTime() - data.startDate.getTime()) / 86_400_000 + 1 > 90) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "A viagem pode ter no máximo 90 dias" });
      }
    } else if (!data.daysCount) {
      ctx.addIssue({ code: "custom", path: ["daysCount"], message: "Informe a quantidade de dias" });
    }
  });
export type CreateTripInput = z.infer<typeof createTripSchema>;

export const itemCategorySchema = z.enum([
  "TRANSPORT",
  "ACCOMMODATION",
  "TOUR",
  "FOOD",
  "CAR_RENTAL",
  "CUSTOM",
]);

export const transportModeSchema = z.enum(["PLANE", "BUS", "TRAIN", "SHIP", "OWN_CAR"]);

// Telas "Voo", "Acomodação" e demais itens do menu "Novo Item" (mesmo formato no form e na API).
// O dia vem como data (viagem com datas) ou número do dia (viagem só com quantidade de dias).
const optText = (max: number) => z.string().trim().max(max).optional();
const day = z.coerce.number().int().min(1).max(90).optional();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida").optional();
const hhmm = z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido").optional();

export const tripItemSchema = z
  .object({
    category: itemCategorySchema,
    transportMode: transportModeSchema.optional(),
    title: optText(120),
    carrier: optText(80),
    code: optText(40),
    originName: optText(120),
    destinationName: optText(120),
    address: optText(200),
    startDate: isoDate,
    startDay: day,
    startTime: hhmm,
    endDate: isoDate,
    endDay: day,
    endTime: hhmm,
    cost: money,
    notes: optText(2000),
  })
  .superRefine((d, ctx) => {
    const req = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    const hasStart = !!(d.startDate || d.startDay);
    const hasEnd = !!(d.endDate || d.endDay);

    if (d.category === "TRANSPORT") {
      if (!d.transportMode) req("transportMode", "Escolha o tipo de transporte");
      if (!d.originName) req("originName", "Informe a origem");
      if (!d.destinationName) req("destinationName", "Informe o destino");
      if (!hasStart) req("startDate", "Informe a data de partida");
      if (!d.startTime) req("startTime", "Informe o horário");
      if (!hasEnd) req("endDate", "Informe a data de chegada");
      if (!d.endTime) req("endTime", "Informe o horário");
    } else if (d.category === "ACCOMMODATION" || d.category === "CAR_RENTAL") {
      if (d.category === "CAR_RENTAL" && !d.title) req("title", "Informe a locadora");
      if (!hasStart) req("startDate", d.category === "CAR_RENTAL" ? "Informe a retirada" : "Informe a chegada");
      if (!hasEnd) req("endDate", d.category === "CAR_RENTAL" ? "Informe a devolução" : "Informe a saída");
    } else {
      if (!d.title) req("title", "Dê um nome para o item");
      if (!hasStart) req("startDate", "Informe a data");
    }

    // Fim não pode ser antes do início
    const start = d.startDate ?? (d.startDay ? String(d.startDay).padStart(4, "0") : "");
    const end = d.endDate ?? (d.endDay ? String(d.endDay).padStart(4, "0") : "");
    if (start && end) {
      const startKey = `${start}T${d.startTime ?? "00:00"}`;
      const endKey = `${end}T${d.endTime ?? "23:59"}`;
      if (endKey < startKey) req("endDate", "O fim deve ser depois do início");
    }
  });
export type TripItemInput = z.infer<typeof tripItemSchema>;

// Arrastar e soltar itens na linha do tempo (2º teste de usabilidade).
// kind: qual "ponta" do item foi arrastada (check-in/retirada = start, check-out/devolução = end).
// order: ids dos itens do dia de destino, na nova ordem.
export const moveTripItemSchema = z.object({
  itemId: z.string().min(1),
  kind: z.enum(["single", "start", "end"]),
  toDay: z.number().int().min(1).max(90),
  order: z.array(z.string().min(1)).max(200),
});
export type MoveTripItemInput = z.infer<typeof moveTripItemSchema>;

// "Ver Progresso": categoria ligada → quantos itens previstos (categoria ausente = desligada)
export const progressPlanSchema = z.object({
  plan: z.partialRecord(itemCategorySchema, z.number().int().min(1, "Mínimo de 1 item").max(30, "Máximo de 30 itens")),
});

// "Estimar Gastos": quanto o usuário deseja gastar
export const updateBudgetSchema = z.object({
  plannedBudget: z.coerce.number().min(0, "O valor não pode ser negativo"),
});

// Cadastro: inclui confirmação de e-mail (2º teste de usabilidade)
export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Digite seu nome completo"),
    email: z.email("Digite um e-mail válido"),
    confirmEmail: z.email("Digite um e-mail válido"),
  })
  .refine((d) => d.email === d.confirmEmail, {
    path: ["confirmEmail"],
    message: "Os e-mails não coincidem",
  });

// Compra de passeio — "Seus Dados"
export const bookingContactSchema = z.object({
  contactFirstName: z.string().trim().min(1, "Digite seu primeiro nome"),
  contactLastName: z.string().trim().min(1, "Digite seu sobrenome"),
  contactEmail: z.email("Digite seu melhor e-mail"),
  contactPhone: z.string().trim().min(8, "Digite seu número de telefone").optional(),
});

// Boas-vindas / Conta: como a pessoa quer ser chamada (login por e-mail não traz o nome)
export const profileNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Digite pelo menos 2 letras")
    .max(60, "Use no máximo 60 caracteres"),
});
