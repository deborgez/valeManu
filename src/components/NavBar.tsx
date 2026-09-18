import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sair } from "./actions";
import ThemeToggle from "./ThemeToggle";

export default async function NavBar() {
  const session = await auth();
  if (!session) return null;

  const imobiliaria = await prisma.imobiliaria.findUnique({
    where: { id: "singleton" },
    select: { nome: true, logoUrl: true },
  });

  const nomeUsuario = session.user.name ?? "";
  const inicial = nomeUsuario.charAt(0).toUpperCase() || "?";

  return (
    <nav className="print:hidden sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-2.5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
      <div className="flex items-center gap-6">
        {imobiliaria?.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imobiliaria.logoUrl}
            alt={imobiliaria.nome}
            className="h-9 w-auto"
          />
        )}
        <div className="h-9 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Hub de Processos
          </span>
          {imobiliaria?.nome && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {imobiliaria.nome}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center gap-2 pl-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-slate-600">
            {inicial}
          </div>
          <span className="hidden text-sm text-slate-600 dark:text-slate-400 sm:inline">
            {nomeUsuario}
          </span>
        </div>
        <form action={sair}>
          <button
            type="submit"
            title="Sair"
            aria-label="Sair"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-red-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        </form>
      </div>
    </nav>
  );
}
