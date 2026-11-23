import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeEntregarVistoria } from "@/lib/perfis";
import SidebarLinks from "./SidebarLinks";

function Titulo({ children, primeiro }: { children: React.ReactNode; primeiro?: boolean }) {
  return (
    <div
      className={`${primeiro ? "" : "mt-4 "}mb-1 px-3 text-sm font-semibold text-slate-800 dark:text-slate-200`}
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
    <aside className="print:hidden w-56 shrink-0 overflow-y-auto border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Módulos
      </p>

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
