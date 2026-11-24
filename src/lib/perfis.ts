export type Perfil = "ADMIN" | "ADMINISTRATIVO" | "VISTORIADOR" | "CORRETOR";

export const LABEL_PERFIL: Record<string, string> = {
  ADMIN: "Administrador",
  ADMINISTRATIVO: "Administrativo",
  VISTORIADOR: "Vistoriador",
  CORRETOR: "Corretor",
};

export const PERFIS: Perfil[] = ["ADMIN", "ADMINISTRATIVO", "VISTORIADOR", "CORRETOR"];

export function perfilValido(valor: unknown): Perfil {
  return PERFIS.includes(valor as Perfil) ? (valor as Perfil) : "ADMINISTRATIVO";
}

export const podeSolicitarVistoria = (role?: string) =>
  role === "ADMIN" || role === "ADMINISTRATIVO" || role === "CORRETOR";

export const podeEntregarVistoria = (role?: string) =>
  role === "ADMIN" || role === "VISTORIADOR";

export function paginaInicial(role?: string): string {
  if (role === "VISTORIADOR") return "/vistorias/solicitacoes";
  if (role === "CORRETOR") return "/cadastro";
  return "/";
}

// Rotas liberadas para perfis restritos. ADMIN e ADMINISTRATIVO não têm restrição de rota.
export function rotaPermitida(role: string | undefined, pathname: string): boolean {
  if (pathname === "/notificacoes" || pathname === "/conta") return true;
  if (pathname.startsWith("/api/exportar/")) return true;
  if (role === "VISTORIADOR") {
    return pathname === "/vistorias" || pathname.startsWith("/vistorias/");
  }
  if (role === "CORRETOR") {
    if (pathname.startsWith("/vistorias/solicitacoes")) return false;
    if (/^\/cadastro\/[^/]+\/editar/.test(pathname)) return false;
    return (
      pathname === "/vistorias" ||
      pathname.startsWith("/vistorias/") ||
      pathname === "/cadastro" ||
      pathname.startsWith("/cadastro/")
    );
  }
  if (pathname.startsWith("/vistorias/solicitacoes")) return podeEntregarVistoria(role);
  return true;
}
