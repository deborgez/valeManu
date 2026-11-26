import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { paginaInicial, rotaPermitida } from "@/lib/perfis";

const PUBLIC_PATHS = ["/login", "/orcamento"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/orcamento") ||
    pathname.startsWith("/api/blob/upload");

  if (isPublic) return NextResponse.next();

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  const role = req.auth.user?.role;
  if (!rotaPermitida(role, pathname)) {
    // Avisos antigos apontam para o quadro; quem não tem acesso vai para a lista de vistorias.
    const destino = pathname.startsWith("/vistorias/solicitacoes")
      ? "/vistorias/entrada"
      : paginaInicial(role);
    return NextResponse.redirect(new URL(destino, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
