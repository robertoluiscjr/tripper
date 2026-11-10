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

/**
 * E-mail do link de acesso (login sem senha). HTML simples em tabelas + versão em texto,
 * em pt-BR e com a identidade do Tripper — e-mails genéricos tendem a cair no spam.
 * Cores em hex porque clientes de e-mail não leem os tokens do CSS do app.
 */
export function magicLinkEmail({ url, hours = 24 }: { url: string; hours?: number }) {
  const blue = "#2765C2";
  const text700 = "#454545";
  const text500 = "#696969";
  const preheader = "Toque no botão para entrar no Tripper. O link vale por " + hours + " horas.";

  const html = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Seu link de acesso ao Tripper</title></head>
<body style="margin:0;padding:0;background:#F0F0F0;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F0F0F0;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFFFF;border-radius:16px;font-family:Arial,Helvetica,sans-serif;">
      <tr><td style="background:${blue};border-radius:16px 16px 0 0;padding:28px 32px;">
        <span style="font-size:32px;line-height:1;font-weight:700;color:#FFFFFF;letter-spacing:-0.5px;">tripper</span>
      </td></tr>
      <tr><td style="padding:32px;">
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${text700};">Seu link de acesso chegou!</h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:${text500};">
          Toque no botão abaixo para entrar no Tripper e continuar planejando sua próxima viagem.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:999px;background:${blue};">
          <a href="${url.replace(/&/g, "&amp;")}" target="_blank" style="display:inline-block;padding:16px 32px;font-size:18px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:999px;">Entrar no Tripper</a>
        </td></tr></table>
        <p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:${text500};">
          O link vale por ${hours} horas e só pode ser usado uma vez. Abra no mesmo aparelho e navegador em que você quer usar o Tripper.
        </p>
        <p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:${text500};">
          Se você não pediu este acesso, pode ignorar este e-mail com tranquilidade: ninguém entra na sua conta sem clicar no link.
        </p>
      </td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid #E5E5E5;font-size:12px;line-height:1.5;color:${text500};">
        Tripper · Planeje sua próxima viagem<br>Este é um e-mail automático, enviado porque alguém pediu um link de acesso com este endereço.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    "Seu link de acesso ao Tripper",
    "",
    "Abra o link abaixo para entrar no Tripper:",
    url,
    "",
    `O link vale por ${hours} horas e só pode ser usado uma vez. Abra no mesmo aparelho e navegador em que você quer usar o Tripper.`,
    "",
    "Se você não pediu este acesso, pode ignorar este e-mail: ninguém entra na sua conta sem clicar no link.",
    "",
    "Tripper · Planeje sua próxima viagem",
  ].join("\n");

  return { subject: "Seu link de acesso ao Tripper", html, text };
}
