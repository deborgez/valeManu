import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeEntregarVistoria } from "@/lib/perfis";
import SidebarLinks from "./SidebarLinks";
import BotaoRecolherMenu from "./BotaoRecolherMenu";

function Titulo({ children, primeiro }: { children: React.ReactNode; primeiro?: boolean }) {
  return (
    <div
      className={`titulo-menu ${primeiro ? "" : "mt-5 "}mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/55`}
    >
      {children}
    </div>
  );
}

export default async function Sidebar() {
  const session = await auth();
  if (!session) return null;

  const role = session.user.role;
  const restrito = role === "VISTORIADOR" || role === "CORRETOR";
  const veEntregas = podeEntregarVistoria(role);

  const pendentes = veEntregas
    ? await prisma.vistoria.count({ where: { status: "PENDENTE" } })
    : 0;

  const linksCadastro =
    role === "CORRETOR"
      ? [{ href: "/cadastro", label: "Processos" }]
      : [
          { href: "/cadastro", label: "Processos" },
          { href: "/prestadores", label: "Prestadores" },
        ];

  const linksVistorias = [
    ...(veEntregas
      ? [{ href: "/vistorias/solicitacoes", label: "Quadro de Solicitações", badge: pendentes }]
      : []),
    { href: "/vistorias/entrada", label: "Vistorias de Entrada" },
    { href: "/vistorias/saida", label: "Vistorias de Saída" },
    { href: "/vistorias/relatorios", label: "Relatório de Vistorias" },
  ];

  const linksManutencoes = [
    { href: "/", label: "Painel" },
    { href: "/manutencoes", label: "Quadro de Manutenções" },
    { href: "/relatorios", label: "Relatório de Manutenções" },
  ];

  const linksDistrato = [
    { href: "/distrato/novo", label: "Novo Distrato" },
    { href: "/distrato", label: "Distratos" },
    { href: "/distrato/relatorios", label: "Relatório de Distratos" },
    { href: "/juridico", label: "Jurídico" },
  ];

  const linksConfiguracoes = [
    { href: "/configuracoes", label: "Unidade" },
    { href: "/usuarios", label: "Usuários" },
  ];

  return (
    <aside className="menu-lateral print:hidden w-72 shrink-0 overflow-y-auto bg-[var(--sidebar-bg)] p-4">
      <div className="menu-topo mb-3 flex items-center justify-between px-3">
        <p className="rotulo-menu text-xs font-semibold uppercase tracking-wider text-white/40">
          Módulos
        </p>
        <BotaoRecolherMenu />
      </div>

      {role !== "VISTORIADOR" && (
        <>
          <Titulo primeiro>Cadastro</Titulo>
          <SidebarLinks links={linksCadastro} />
        </>
      )}

      <Titulo primeiro={role === "VISTORIADOR"}>Vistorias</Titulo>
      <SidebarLinks links={linksVistorias} />

      {!restrito && (
        <>
          <Titulo>Manutenções</Titulo>
          <SidebarLinks links={linksManutencoes} />

          <Titulo>Distrato</Titulo>
          <SidebarLinks links={linksDistrato} />
        </>
      )}

      {role === "ADMIN" && (
        <>
          <Titulo>Configurações</Titulo>
          <SidebarLinks links={linksConfiguracoes} />
        </>
      )}
    </aside>
  );
}
