#!/usr/bin/env node
/**
 * Setup interativo do .env — `npm run setup`
 * Lê .env.example, pergunta cada valor (Enter mantém o atual) e grava .env.
 * AUTH_SECRET é gerado automaticamente se estiver vazio.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const parse = (text) =>
  Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((l) => l.match(/^([A-Z0-9_]+)=(.*?)(\s+#.*)?$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2].replace(/^"|"$/g, "")]),
  );

const example = readFileSync(".env.example", "utf8");
const current = existsSync(".env") ? parse(readFileSync(".env", "utf8")) : {};
const keys = Object.keys(parse(example));

const rl = createInterface({ input, output });
console.log("\n✈️  Tripper — configuração do .env (Enter mantém o valor atual)\n");

// `node scripts/setup.mjs CHAVE1 CHAVE2` pergunta só essas chaves (mantém as demais)
const only = process.argv.slice(2);
const asked = only.length ? keys.filter((k) => only.includes(k)) : keys;

const values = { ...current };
for (const key of asked) {
  if (key === "AUTH_SECRET" && !values[key]) {
    values[key] = randomBytes(32).toString("base64");
    console.log(`${key}: gerado automaticamente`);
    continue;
  }
  const shown = values[key] ? ` [${values[key].slice(0, 12)}${values[key].length > 12 ? "…" : ""}]` : "";
  const answer = (await rl.question(`${key}${shown}: `)).trim();
  if (answer) values[key] = answer;
  values[key] ??= parse(example)[key] ?? "";
}
rl.close();

// A mesma chave do Resend serve para o login por e-mail e para os e-mails do app
if (values.AUTH_RESEND_KEY && !values.RESEND_API_KEY) values.RESEND_API_KEY = values.AUTH_RESEND_KEY;

const out = keys.map((k) => `${k}="${values[k] ?? ""}"`).join("\n") + "\n";
writeFileSync(".env", out);
console.log("\n✅ .env salvo. Próximo passo: npm run db:push\n");
