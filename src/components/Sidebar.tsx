import { auth } from "@/lib/auth";
import SidebarLinks from "./SidebarLinks";

export default async function Sidebar() {
  const session = await auth();
  if (!session) return null;

  const linksCadastro = [
    { href: "/cadastro", label: "Processos" },
    { href: "/prestadores", label: "Prestadores" },
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
  ];

  const linksJuridico = [{ href: "/juridico", label: "Jurídico" }];

  const linksConfiguracoes = [
    { href: "/configuracoes", label: "Unidade" },
    { href: "/usuarios", label: "Usuários" },
  ];

  return (
    <aside className="print:hidden w-56 shrink-0 overflow-y-auto border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Módulos
      </p>

      <div className="mb-1 px-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
        Cadastro
      </div>
      <SidebarLinks links={linksCadastro} />

      <div className="mt-4 mb-1 px-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
        Manutenções
      </div>
      <SidebarLinks links={linksManutencoes} />

      <div className="mt-4 mb-1 px-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
        Distrato
      </div>
      <SidebarLinks links={linksDistrato} />

      <div className="mt-4 mb-1 px-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
        Jurídico
      </div>
      <SidebarLinks links={linksJuridico} />

      {session.user.role === "ADMIN" && (
        <>
          <div className="mt-4 mb-1 px-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
            Configurações
          </div>
          <SidebarLinks links={linksConfiguracoes} />
        </>
      )}
    </aside>
  );
}
