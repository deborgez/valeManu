import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEndereco } from "@/lib/endereco";
import { formatData, formatDataHora, hojeSaoPaulo, parseDataLocal } from "@/lib/datahora";
import { formatMoedaExibicao } from "@/lib/masks";
import { podeEntregarVistoria, podeSolicitarVistoria } from "@/lib/perfis";
import { LABEL_TIPO_VISTORIA, prazoVistoria, situacaoVistoria } from "@/lib/vistorias";
import { concluirVistoria, solicitarVistoria } from "@/app/vistorias/actions";
import ArquivoPreviewBotao from "@/components/distrato/ArquivoPreviewBotao";
import NovaVistoriaModal from "./NovaVistoriaModal";
import ConcluirVistoriaModal from "./ConcluirVistoriaModal";

export default async function QuadroVistorias({ tipo }: { tipo: "ENTRADA" | "SAIDA" }) {
  const session = await auth();
  const role = session?.user.role;
  const podeSolicitar = podeSolicitarVistoria(role);
  const podeEntregar = podeEntregarVistoria(role);
  const tipoLabel = LABEL_TIPO_VISTORIA[tipo];
  const hojeStr = hojeSaoPaulo();
  const hoje = parseDataLocal(hojeStr);

  const vistorias = await prisma.vistoria.findMany({
    where: { tipo },
    orderBy: { createdAt: "desc" },
    include: {
      processo: true,
      solicitadoPor: { select: { nome: true } },
      entreguePor: { select: { nome: true } },
    },
  });

  const processos = podeSolicitar
    ? await prisma.processo.findMany({
        orderBy: { numeroProcesso: "asc" },
        select: {
          id: true,
          numeroProcesso: true,
          valorAluguel: true,
          rua: true,
          numero: true,
          complemento: true,
          bairro: true,
          cidade: true,
          estado: true,
        },
      })
    : [];

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Vistorias de {tipoLabel}
        </h1>
        {podeSolicitar && (
          <NovaVistoriaModal
            tipoLabel={tipoLabel}
            processos={processos.map((p) => ({
              id: p.id,
              numeroProcesso: p.numeroProcesso,
              endereco: formatEndereco(p),
              valor: p.valorAluguel ? formatMoedaExibicao(p.valorAluguel) : null,
            }))}
            action={async (formData: FormData) => {
              "use server";
              await solicitarVistoria(tipo, formData);
            }}
          />
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Imóvel</th>
              <th className="px-4 py-2">Valor</th>
              <th className="px-4 py-2">Solicitada em</th>
              <th className="px-4 py-2">Prazo</th>
              <th className="px-4 py-2">Situação</th>
              <th className="px-4 py-2">Sinal</th>
              {podeEntregar && <th className="px-4 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {vistorias.map((v) => {
              const situacao = situacaoVistoria(v, hoje);
              return (
                <tr key={v.id} className="border-t border-slate-100 dark:border-slate-700 align-top">
                  <td className="px-4 py-2">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {v.processo.numeroProcesso}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatEndereco(v.processo)}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    {v.processo.valorAluguel ? `R$ ${formatMoedaExibicao(v.processo.valorAluguel)}` : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {formatData(v.createdAt)}
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {v.solicitadoPor.nome}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    {formatData(prazoVistoria(v.createdAt))}
                  </td>
                  <td className="px-4 py-2">
                    <p className={`font-medium ${situacao.cor}`}>{situacao.texto}</p>
                    {v.status === "ENTREGUE" && v.entregueHora && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        às {v.entregueHora}
                        {v.entreguePor ? ` — ${v.entreguePor.nome}` : ""}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <ArquivoPreviewBotao
                      url={v.comprovanteUrl}
                      nome={v.comprovanteNome}
                      tipo={v.comprovanteTipo}
                      label="Ver comprovante"
                    />
                  </td>
                  {podeEntregar && (
                    <td className="px-4 py-2 text-right">
                      {v.status === "PENDENTE" && (
                        <ConcluirVistoriaModal
                          hoje={hojeStr}
                          action={async (formData: FormData) => {
                            "use server";
                            await concluirVistoria(v.id, formData);
                          }}
                        />
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {vistorias.length === 0 && (
              <tr>
                <td
                  colSpan={podeEntregar ? 7 : 6}
                  className="px-4 py-6 text-center text-slate-400 dark:text-slate-500"
                >
                  Nenhuma vistoria de {tipoLabel.toLowerCase()} solicitada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
        Prazo de entrega: 5 dias úteis a partir da data de solicitação. Atualizado em{" "}
        {formatDataHora(new Date())}.
      </p>
    </div>
  );
}
