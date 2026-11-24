import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatEndereco } from "@/lib/endereco";
import { formatData, hojeSaoPaulo, parseDataLocal } from "@/lib/datahora";
import { formatMoedaExibicao } from "@/lib/masks";
import { podeEntregarVistoria } from "@/lib/perfis";
import { LABEL_TIPO_VISTORIA, prazoVistoria } from "@/lib/vistorias";
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
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {v.processo.numeroProcesso}
                </p>
                <p className="text-slate-600 dark:text-slate-400">{formatEndereco(v.processo)}</p>
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
                  <ArquivoPreviewBotao
                    url={v.comprovanteUrl}
                    nome={v.comprovanteNome}
                    tipo={v.comprovanteTipo}
                    label="Ver comprovante do sinal"
                  />
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
    </div>
  );
}
