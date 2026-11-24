import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sair } from "./actions";
import ThemeToggle from "./ThemeToggle";
import NotificacoesSino from "./NotificacoesSino";
import BuscaGlobal from "./BuscaGlobal";
import BotaoMenu from "./BotaoMenu";
import { formatDataHora } from "@/lib/datahora";
import { LABEL_PERFIL } from "@/lib/perfis";
import Link from "next/link";

export default async function NavBar() {
  const session = await auth();
  if (!session) return null;

  const imobiliaria = await prisma.imobiliaria.findUnique({
    where: { id: "singleton" },
    select: { nome: true, logoUrl: true, logoUrlDark: true },
  });

  const [notificacoes, naoLidas] = await Promise.all([
    prisma.notificacao.findMany({
      where: { usuarioId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notificacao.count({ where: { usuarioId: session.user.id, lida: false } }),
  ]);

  const nomeUsuario = session.user.name ?? "";
  const inicial = nomeUsuario.charAt(0).toUpperCase() || "?";
  const perfil = LABEL_PERFIL[session.user.role] ?? "";

  return (
    <nav className="print:hidden sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/85">
      <div className="h-0.5 bg-gradient-to-r from-[var(--accent)] via-[color-mix(in_srgb,var(--accent)_45%,white)] to-transparent" />
      <div className="flex items-center gap-4 px-4 py-2.5 md:px-6">
        <div className="flex shrink-0 items-center gap-3 md:gap-5">
          <BotaoMenu />
          {imobiliaria?.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imobiliaria.logoUrl}
              alt={imobiliaria.nome}
              className={`h-9 w-auto ${imobiliaria.logoUrlDark ? "dark:hidden" : ""}`}
            />
          )}
          {imobiliaria?.logoUrlDark && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imobiliaria.logoUrlDark}
              alt={imobiliaria.nome}
              className="hidden h-9 w-auto dark:block"
            />
          )}
          <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-700 lg:block" />
          <div className="hidden flex-col leading-tight lg:flex">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Hub de Processos
            </span>
            {imobiliaria?.nome && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {imobiliaria.nome}
              </span>
            )}
          </div>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          {session.user.role !== "VISTORIADOR" && <BuscaGlobal />}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0">
          <NotificacoesSino
            naoLidas={naoLidas}
            itens={notificacoes.map((n) => ({
              id: n.id,
              mensagem: n.mensagem,
              link: n.link,
              lida: n.lida,
              quando: formatDataHora(n.createdAt),
            }))}
          />
          <ThemeToggle />
          <div className="mx-1.5 hidden h-7 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
          <Link
            href="/conta"
            title="Minha conta"
            className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-1 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 sm:pr-4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_55%,#8b9cff)] text-xs font-semibold text-white">
              {inicial}
            </div>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {nomeUsuario}
              </span>
              {perfil && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">{perfil}</span>
              )}
            </div>
          </Link>
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
      </div>
    </nav>
  );
}
