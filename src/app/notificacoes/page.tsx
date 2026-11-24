import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDataHora } from "@/lib/datahora";
import { LABEL_CATEGORIA, type CategoriaNotificacao } from "@/lib/notificacoes";
import NotificacaoLinha from "@/components/NotificacaoLinha";
import { marcarTodasNotificacoesLidas, salvarPreferenciasNotificacao } from "./actions";

export default async function NotificacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const session = await auth();
  if (!session) return null;
  const { filtro } = await searchParams;
  const somenteNaoLidas = filtro === "nao-lidas";

  const [notificacoes, usuario, naoLidas] = await Promise.all([
    prisma.notificacao.findMany({
      where: { usuarioId: session.user.id, ...(somenteNaoLidas ? { lida: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { notificacoesDesativadas: true },
    }),
    prisma.notificacao.count({ where: { usuarioId: session.user.id, lida: false } }),
  ]);

  const desativadas = new Set(usuario?.notificacoesDesativadas ?? []);
  const abas = [
    { id: "todas", rotulo: "Todas", href: "/notificacoes" },
    { id: "nao-lidas", rotulo: `Não lidas (${naoLidas})`, href: "/notificacoes?filtro=nao-lidas" },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Notificações</h1>
        {naoLidas > 0 && (
          <form action={marcarTodasNotificacoesLidas}>
            <button
              type="submit"
              className="rounded border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Marcar todas como lidas
            </button>
          </form>
        )}
      </div>

      <div className="mb-4 inline-flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {abas.map((aba) => {
          const ativa = (aba.id === "nao-lidas") === somenteNaoLidas;
          return (
            <Link
              key={aba.id}
              href={aba.href}
              className={
                ativa
                  ? "rounded-lg bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-white"
                  : "rounded-lg px-4 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              }
            >
              {aba.rotulo}
            </Link>
          );
        })}
      </div>

      <ul className="mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {notificacoes.map((n) => (
          <NotificacaoLinha
            key={n.id}
            id={n.id}
            mensagem={n.mensagem}
            link={n.link}
            lida={n.lida}
            quando={formatDataHora(n.createdAt)}
            categoria={LABEL_CATEGORIA[n.categoria as CategoriaNotificacao] ?? "Geral"}
          />
        ))}
        {notificacoes.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
            Nenhuma notificação por aqui.
          </li>
        )}
      </ul>

      <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
          O que você quer receber
        </h2>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Desmarque os assuntos dos quais não quer receber avisos. Isso vale só para a sua conta.
        </p>
        <form action={salvarPreferenciasNotificacao} className="flex flex-col gap-2">
          {(Object.keys(LABEL_CATEGORIA) as CategoriaNotificacao[]).map((categoria) => (
            <label
              key={categoria}
              className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <input
                type="checkbox"
                name="categoria"
                value={categoria}
                defaultChecked={!desativadas.has(categoria)}
                className="h-4 w-4"
              />
              {LABEL_CATEGORIA[categoria]}
            </label>
          ))}
          <button
            type="submit"
            className="mt-2 w-fit rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
          >
            Salvar preferências
          </button>
        </form>
      </section>
    </div>
  );
}
