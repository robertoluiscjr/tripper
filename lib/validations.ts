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

// Telas "Voo", "Acomodação" e demais itens do menu "Novo Item"
export const createTripItemSchema = z.object({
  category: itemCategorySchema,
  title: z.string().trim().min(1, "Campo obrigatório").max(120),
  dayNumber: z.coerce.number().int().min(1),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  cost: money,
  notes: z.string().max(2000).optional(),
  address: z.string().max(200).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  transportMode: transportModeSchema.optional(),
  carrier: z.string().max(80).optional(),
  code: z.string().max(40).optional(),
  originName: z.string().max(120).optional(),
  destinationName: z.string().max(120).optional(),
});
export type CreateTripItemInput = z.infer<typeof createTripItemSchema>;

// Arrastar e soltar itens na linha do tempo (2º teste de usabilidade)
export const reorderTripItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      dayNumber: z.number().int().min(1),
      position: z.number().int().min(0),
    }),
  ),
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
