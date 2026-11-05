#!/usr/bin/env node
/**
 * `npm run preview` — roda o Tripper localmente em modo produção (estável, rápido,
 * sem recarregamento automático do `next dev`) com o login de teste da Ana liberado.
 *   1. next build   2. next start em http://localhost:3000
 * Entrar como Ana: http://localhost:3000/api/dev/login
 */
import { spawnSync, spawn } from "node:child_process";

const env = { ...process.env, TRIPPER_DEV_LOGIN: "1" };
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

console.log("\n✈️  Gerando a versão de produção do Tripper (leva ~1 min)...\n");
const build = spawnSync(npx, ["next", "build"], { stdio: "inherit", env, shell: process.platform === "win32" });
if (build.status !== 0) process.exit(build.status ?? 1);

console.log("\n✅ Pronto! Abra http://localhost:3000/api/dev/login para entrar como Ana.\n");
const server = spawn(npx, ["next", "start", "-p", process.env.PORT ?? "3000"], { stdio: "inherit", env, shell: process.platform === "win32" });
server.on("exit", (code) => process.exit(code ?? 0));
