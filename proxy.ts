import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (antigo "middleware" — renomeado no Next.js 16).
 * Checagem otimista e LEVE: só verifica se o cookie de sessão do Auth.js existe.
 * Nunca importe Auth.js/Prisma/Resend aqui (bundle pesado). A validação real
 * da sessão acontece no layout de app/(auth) via `auth()`.
 */
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/app/:path*", "/settings/:path*"],
};
