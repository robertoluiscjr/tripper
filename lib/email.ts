import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY não configurada");
  _resend = new Resend(key);
  return _resend;
}

const FROM = process.env.EMAIL_FROM ?? "Tripper <onboarding@resend.dev>";

/** E-mail transacional genérico (boas-vindas, confirmação de compra, lembretes...). */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
  if (error) throw new Error(`Falha ao enviar e-mail: ${error.message}`);
  return data;
}

export function welcomeEmail(name?: string | null) {
  const first = name?.split(" ")[0] ?? "viajante";
  return {
    subject: "Boas-vindas ao Tripper ✈️",
    html: `<div style="font-family:Jost,Arial,sans-serif;color:#454545">
      <h1 style="color:#2765C2">Olá, ${first}!</h1>
      <p>Que bom ter você no Tripper. Planeje sua próxima viagem, elabore o roteiro,
      estime os gastos e acompanhe a evolução do seu planejamento — tudo em um só lugar.</p>
      <p>Seu período de teste de 14 dias já começou.</p>
    </div>`,
  };
}
