#!/usr/bin/env node
/**
 * `npm run env:push` — envia para a Vercel (Production e Preview) as chaves de
 * login e e-mail que estão no seu .env, sem que elas apareçam na tela.
 * Depois de rodar, publique de novo (git push ou `vercel --prod`).
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const KEYS = ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "AUTH_RESEND_KEY", "RESEND_API_KEY", "EMAIL_FROM"];
const SECRET = new Set(["AUTH_GOOGLE_SECRET", "AUTH_RESEND_KEY", "RESEND_API_KEY"]);

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].trim().replace(/^"|"$/g, "")]),
);

const vercel = process.platform === "win32" ? "npx.cmd" : "npx";
let sent = 0;

for (const key of KEYS) {
  const value = env[key];
  if (!value) {
    console.log(`– ${key}: vazio no .env, pulei`);
    continue;
  }
  for (const target of ["production", "preview"]) {
    // remove o valor antigo (se houver) e grava o novo
    spawnSync(vercel, ["vercel", "env", "rm", key, target, "--yes"], { stdio: "ignore", shell: process.platform === "win32" });
    // O valor vai pela entrada padrão (stdin), não na linha de comando: assim caracteres
    // como < > & não são interpretados pelo Windows e a chave não aparece na lista de processos.
    const args = ["vercel", "env", "add", key, target, "--yes", SECRET.has(key) ? "--sensitive" : "--no-sensitive"];
    const r = spawnSync(vercel, args, { input: value, stdio: ["pipe", "ignore", "ignore"], shell: process.platform === "win32" });
    console.log(`${r.status === 0 ? "✓" : "✗"} ${key} → ${target}`);
    if (r.status === 0) sent++;
  }
}

console.log(sent ? "\n✅ Chaves enviadas para a Vercel. Agora é só publicar de novo." : "\nNenhuma chave enviada — preencha o .env com `npm run setup`.");
