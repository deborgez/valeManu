import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEndereco } from "@/lib/endereco";
import { formatData, hojeSaoPaulo, parseDataLocal } from "@/lib/datahora";
import { formatMoedaExibicao } from "@/lib/masks";
import { podeEntregarVistoria } from "@/lib/perfis";
import { LABEL_TIPO_VISTORIA, prazoVistoria, situacaoVistoria } from "@/lib/vistorias";
import { concluirVistoria } from "../actions";
import { gerarLembretes } from "@/lib/lembretes";
import ArquivoPreviewBotao from "@/components/distrato/ArquivoPreviewBotao";
import ConcluirVistoriaModal from "@/components/vistorias/ConcluirVistoriaModal";

export default async function QuadroSolicitacoesPage() {
  const session = await auth();
  if (!podeEntregarVistoria(session?.user.role)) redirect("/vistorias/entrada");

  await gerarLembretes();
  const hojeStr = hojeSaoPaulo();
  const hoje = parseDataLocal(hojeStr);

  const pendentes = await prisma.vistoria.findMany({
    where: { status: "PENDENTE" },
    orderBy: { createdAt: "asc" },
    include: {
      processo: true,
      solicitadoPor: { select: { nome: true } },
    },
  });

  const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
  const concluidas = await prisma.vistoria.findMany({
    where: { status: "ENTREGUE", entregueData: { gte: seteDiasAtras } },
    orderBy: [{ entregueData: "desc" }, { createdAt: "desc" }],
    include: {
      processo: true,
      solicitadoPor: { select: { nome: true } },
      entreguePor: { select: { nome: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Quadro de Solicitações
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {pendentes.length === 0
            ? "Nenhuma vistoria pendente"
            : `${pendentes.length} ${pendentes.length === 1 ? "vistoria pendente" : "vistorias pendentes"}`}
        </p>
      </div>

      {pendentes.length === 0 ? (
        <p className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-sm text-slate-400 dark:text-slate-500">
          Quando uma vistoria for solicitada, ela aparecerá aqui.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {pendentes.map((v) => {
            const limite = prazoVistoria(v);
            const atrasada = hoje > limite;
            const nova = v.createdAt >= hoje;
            return (
              <div
                key={v.id}
                className={`rounded-lg border bg-white dark:bg-slate-800 p-4 text-sm ${
                  atrasada
                    ? "border-red-300 dark:border-red-800"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-slate-900 dark:bg-slate-600 px-2 py-0.5 text-xs font-medium text-white">
                    {LABEL_TIPO_VISTORIA[v.tipo]}
                  </span>
                  {nova && (
                    <span className="rounded bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                      Nova
                    </span>
                  )}
                  {atrasada && (
                    <span className="rounded bg-red-100 dark:bg-red-900 px-2 py-0.5 text-xs font-medium text-red-800 dark:text-red-300">
                      Prazo vencido
                    </span>
                  )}
                </div>
                <Link href={`/vistorias/${v.id}`} className="group block">
                  <span className="block font-semibold text-[var(--accent)] underline-offset-2 group-hover:underline dark:text-blue-200">
                    {v.processo.numeroProcesso}
                  </span>
                  <span className="block text-slate-600 dark:text-slate-400">
                    {formatEndereco(v.processo)}
                  </span>
                </Link>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Valor:{" "}
                  {v.processo.valorAluguel ? `R$ ${formatMoedaExibicao(v.processo.valorAluguel)}` : "—"}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Solicitada em {formatData(v.createdAt)} por {v.solicitadoPor.nome}
                </p>
                {v.agendadaPara && (
                  <p className="mt-1 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Agendada para {formatData(v.agendadaPara)}
                    {v.horaAgendada ? ` às ${v.horaAgendada}` : ""}
                  </p>
                )}
                <p className="text-slate-500 dark:text-slate-400">
                  Entregar até {formatData(limite)}
                </p>
                {v.tipo === "SAIDA" && (v.locadorDesejaParticipar || v.locatarioDesejaParticipar) && (
                  <p className="mt-2 rounded bg-amber-50 dark:bg-amber-950 px-2 py-1 text-xs font-medium text-amber-800 dark:text-amber-300">
                    {[
                      v.locadorDesejaParticipar && "Locador deseja participar",
                      v.locatarioDesejaParticipar && "Locatário deseja participar",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  {v.comprovanteUrl ? (
                    <ArquivoPreviewBotao
                      url={v.comprovanteUrl}
                      nome={v.comprovanteNome}
                      tipo={v.comprovanteTipo}
                      label="Ver comprovante do sinal"
                    />
                  ) : (
                    <span />
                  )}
                  <ConcluirVistoriaModal
                    hoje={hojeStr}
                    participacao={v.tipo === "SAIDA"}
                    action={async (formData: FormData) => {
                      "use server";
                      await concluirVistoria(v.id, formData);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {concluidas.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Concluídas nos últimos 7 dias
          </h2>
          <ul className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            {concluidas.map((v) => {
              const situacao = situacaoVistoria(v, hoje);
              return (
                <li
                  key={v.id}
                  className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 dark:border-slate-700"
                >
                  <div>
                    <Link
                      href={`/vistorias/${v.id}`}
                      className="font-medium text-[var(--accent)] underline-offset-2 hover:underline dark:text-blue-200"
                    >
                      {LABEL_TIPO_VISTORIA[v.tipo]} — {v.processo.numeroProcesso}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatEndereco(v.processo)}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Solicitada em {formatData(v.createdAt)} por {v.solicitadoPor.nome}
                      {v.entreguePor ? ` · concluída por ${v.entreguePor.nome}` : ""}
                    </p>
                    {v.descricaoConclusao && (
                      <p className="mt-1 whitespace-pre-line text-xs text-slate-600 dark:text-slate-300">
                        {v.descricaoConclusao}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${situacao.cor}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {situacao.rotulo}
                    </span>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {situacao.detalhe}
                      {v.entregueHora ? ` às ${v.entregueHora}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
