import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CopyLinkButton from "@/components/CopyLinkButton";
import AgendarServicoForm from "@/components/AgendarServicoForm";
import { gerarPedidoOrcamento } from "../pedidos-actions";
import {
  entregarOrcamento,
  marcarOrcamentoNaoEntregue,
  aprovarPedido,
  reprovarPedido,
  iniciarServicoImediato,
  agendarServico,
  concluirServico,
  reabrirServico,
} from "../fluxo-actions";
import { headers } from "next/headers";
import MoedaInput from "@/components/inputs/MoedaInput";
import { formatMoedaExibicao } from "@/lib/masks";
import BlobUploadInput from "@/components/inputs/BlobUploadInput";
import { formatEndereco } from "@/lib/endereco";
import EditarEnderecoForm from "@/components/EditarEnderecoForm";
import { atualizarEndereco } from "../actions";
import TrilhaEtapas from "@/components/TrilhaEtapas";
import { etapaAtualIndex } from "@/lib/trilha";
import { LABEL_MANUTENCAO_STATUS, LABEL_PEDIDO_STATUS } from "@/lib/labels";
import ImpressaoModal from "@/components/ImpressaoModal";
import OrcamentoDocumento from "@/components/OrcamentoDocumento";
import OrdemServicoDocumento from "@/components/OrdemServicoDocumento";

const LABEL_PARTE: Record<string, string> = {
  LOCADOR: "Locador",
  LOCATARIO: "Locatário",
};

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export default async function ManutencaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const manutencao = await prisma.manutencao.findUnique({
    where: { id },
    include: {
      criadoPor: true,
      pedidosOrcamento: {
        include: { prestador: true, geradoPor: true, anexos: true },
        orderBy: { createdAt: "asc" },
      },
      inicioServico: { include: { pedidoOrcamentoAprovado: true } },
      conclusaoServico: true,
    },
  });

  if (!manutencao) notFound();

  const prestadores = await prisma.prestador.findMany({
    orderBy: { nome: "asc" },
  });

  const imobiliaria = await prisma.imobiliaria.findUnique({
    where: { id: "singleton" },
  });

  const baseUrl = await getBaseUrl();

  const pedidoAprovado = manutencao.pedidosOrcamento.find(
    (p) => p.status === "APROVADO"
  );
  const pedidosAguardandoEntrega = manutencao.pedidosOrcamento.filter(
    (p) => p.status === "AGUARDANDO_ENTREGA"
  );
  const pedidosAguardandoAprovacao = manutencao.pedidosOrcamento.filter(
    (p) => p.status === "ENTREGUE_AGUARDANDO_APROVACAO"
  );

  const etapaAtual = etapaAtualIndex(
    manutencao.status,
    manutencao.pedidosOrcamento.length > 0
  );

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <TrilhaEtapas etapaAtual={etapaAtual} />

      <div className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Processo {manutencao.numeroProcesso}
          </h1>
          <div className="flex gap-2">
            {manutencao.reaberta && (
              <span className="rounded bg-orange-100 dark:bg-orange-900 px-2 py-1 text-xs font-medium text-orange-700 dark:text-orange-400">
                Serviço Reaberto
              </span>
            )}
            {manutencao.emergencial && (
              <span className="rounded bg-red-100 dark:bg-red-900 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400">
                Emergencial
              </span>
            )}
          </div>
        </div>
        <EditarEnderecoForm
          enderecoFormatado={formatEndereco(manutencao)}
          defaultValues={manutencao}
          action={async (formData: FormData) => {
            "use server";
            await atualizarEndereco(manutencao.id, formData);
          }}
        />
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
          <p>
            <span className="text-slate-400 dark:text-slate-500">Solicitante: </span>
            {LABEL_PARTE[manutencao.solicitanteTipo]}
            {manutencao.solicitanteNome ? ` — ${manutencao.solicitanteNome}` : ""}
            {manutencao.solicitanteCpf ? ` (${manutencao.solicitanteCpf})` : ""}
          </p>
          <p>
            <span className="text-slate-400 dark:text-slate-500">Competência: </span>
            {LABEL_PARTE[manutencao.competencia]}
          </p>
          <p>
            <span className="text-slate-400 dark:text-slate-500">Natureza: </span>
            {manutencao.natureza}
          </p>
          <p>
            <span className="text-slate-400 dark:text-slate-500">Status: </span>
            {LABEL_MANUTENCAO_STATUS[manutencao.status] ?? manutencao.status}
          </p>
        </div>
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
          {manutencao.descricaoProblema}
        </p>
      </div>

      {/* Pedido de Orçamento */}
      <section className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Pedido de Orçamento
        </h2>

        {manutencao.status !== "CONCLUIDA" && (
          <form
            action={async (formData: FormData) => {
              "use server";
              await gerarPedidoOrcamento(manutencao.id, formData);
            }}
            className="mb-6 flex flex-wrap items-end gap-3"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Profissional
              </label>
              <select
                name="prestadorId"
                required
                className="rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
              >
                {prestadores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.especialidade})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Fotos / Vídeos do problema
              </label>
              <BlobUploadInput name="anexos" multiple accept="image/*,video/*" />
            </div>
            <button
              type="submit"
              className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
            >
              Gerar Pedido
            </button>
          </form>
        )}

        <div className="flex flex-col gap-2">
          {manutencao.pedidosOrcamento.map((pedido) => (
            <div
              key={pedido.id}
              className="flex items-center justify-between rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium">{pedido.prestador.nome}</span>{" "}
                <span className="text-slate-400 dark:text-slate-500">
                  — {LABEL_PEDIDO_STATUS[pedido.status]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {pedido.status !== "AGUARDANDO_ENTREGA" && (
                  <ImpressaoModal label="Imprimir">
                    <OrcamentoDocumento
                      imobiliaria={imobiliaria}
                      numeroProcesso={manutencao.numeroProcesso}
                      descricaoProblema={manutencao.descricaoProblema}
                      natureza={manutencao.natureza}
                      competencia={manutencao.competencia}
                      endereco={manutencao}
                      prestador={pedido.prestador}
                      valorMaoDeObra={pedido.valorMaoDeObra}
                      valorMaterial={pedido.valorMaterial}
                      descricaoServico={pedido.descricaoServico}
                      geradoPorNome={pedido.geradoPor.nome}
                    />
                  </ImpressaoModal>
                )}
                <CopyLinkButton link={`${baseUrl}/orcamento/${pedido.token}`} />
              </div>
            </div>
          ))}
          {manutencao.pedidosOrcamento.length === 0 && (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Nenhum pedido de orçamento gerado ainda.
            </p>
          )}
        </div>
      </section>

      {/* Entrega do Orçamento */}
      {pedidosAguardandoEntrega.length > 0 && (
        <section className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Entrega do Orçamento
          </h2>
          <div className="flex flex-col gap-4">
            {pedidosAguardandoEntrega.map((pedido) => (
              <div
                key={pedido.id}
                className="rounded border border-slate-100 dark:border-slate-700 p-4"
              >
                <p className="mb-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                  {pedido.prestador.nome}
                </p>
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    await entregarOrcamento(pedido.id, manutencao.id, formData);
                  }}
                  className="mb-2 flex flex-wrap items-end gap-3"
                >
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Mão de obra (R$)
                    </label>
                    <MoedaInput
                      name="valorMaoDeObra"
                      required
                      className="w-32 rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Material (R$)
                    </label>
                    <MoedaInput
                      name="valorMaterial"
                      required
                      className="w-32 rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Descrição do serviço
                    </label>
                    <input
                      name="descricaoServico"
                      required
                      className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Arquivo do orçamento
                    </label>
                    <BlobUploadInput
                      name="arquivoOrcamento"
                      accept="image/*,application/pdf"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
                  >
                    Salvar
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await marcarOrcamentoNaoEntregue(pedido.id, manutencao.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs text-red-600 dark:text-red-400 underline"
                  >
                    Orçamento não entregue
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Aprovação do Serviço */}
      {pedidosAguardandoAprovacao.length > 0 && (
        <section className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Aprovação do Serviço
          </h2>
          <div className="flex flex-col gap-3">
            {pedidosAguardandoAprovacao.map((pedido) => (
              <div
                key={pedido.id}
                className="flex items-center justify-between rounded border border-slate-100 dark:border-slate-700 p-4"
              >
                <div className="text-sm">
                  <p className="font-medium">{pedido.prestador.nome}</p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Mão de obra: R$ {formatMoedaExibicao(pedido.valorMaoDeObra)} |
                    Material: R$ {formatMoedaExibicao(pedido.valorMaterial)}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">{pedido.descricaoServico}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Aguardando aprovação
                  </p>
                </div>
                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await aprovarPedido(pedido.id, manutencao.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded bg-green-600 dark:bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:hover:bg-green-800"
                    >
                      Aprovado
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await reprovarPedido(pedido.id, manutencao.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded bg-red-600 dark:bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-800"
                    >
                      Reprovado
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Início do Serviço */}
      {pedidoAprovado && manutencao.status !== "CONCLUIDA" && (
        <section className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Início do Serviço
          </h2>
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
            Orçamento aprovado: {pedidoAprovado.prestador.nome}
          </p>

          {!manutencao.inicioServico && (
            <div className="flex gap-3">
              <form
                action={async () => {
                  "use server";
                  await iniciarServicoImediato(manutencao.id, pedidoAprovado.id);
                }}
              >
                <button
                  type="submit"
                  className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
                >
                  Início imediato
                </button>
              </form>
              <AgendarServicoForm
                action={async (formData: FormData) => {
                  "use server";
                  await agendarServico(
                    manutencao.id,
                    pedidoAprovado.id,
                    formData
                  );
                }}
              />
            </div>
          )}

          {manutencao.inicioServico?.status === "AGENDADO" && (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Agendado para{" "}
              {manutencao.inicioServico.dataHoraAgendada?.toLocaleString(
                "pt-BR"
              )}
            </p>
          )}

          {manutencao.inicioServico?.status === "INICIADO_ANDAMENTO" && (
            <p className="text-sm text-blue-700 dark:text-blue-400">Iniciado - em andamento</p>
          )}

          {manutencao.inicioServico && (
            <div className="mt-3">
              <ImpressaoModal label="Imprimir Ordem de Serviço">
                <OrdemServicoDocumento
                  imobiliaria={imobiliaria}
                  numeroProcesso={manutencao.numeroProcesso}
                  descricaoProblema={manutencao.descricaoProblema}
                  natureza={manutencao.natureza}
                  competencia={manutencao.competencia}
                  endereco={manutencao}
                  prestador={pedidoAprovado.prestador}
                  valorMaoDeObra={pedidoAprovado.valorMaoDeObra}
                  valorMaterial={pedidoAprovado.valorMaterial}
                  descricaoServico={pedidoAprovado.descricaoServico}
                  tipoInicio={manutencao.inicioServico.tipo}
                  dataHoraAgendada={manutencao.inicioServico.dataHoraAgendada}
                />
              </ImpressaoModal>
            </div>
          )}
        </section>
      )}

      {/* Conclusão do Serviço */}
      {manutencao.status === "EM_ANDAMENTO" && (
          <section className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Conclusão do Serviço
            </h2>
            <form
              action={async (formData: FormData) => {
                "use server";
                await concluirServico(manutencao.id, formData);
              }}
              className="flex flex-col gap-3"
            >
              <textarea
                name="observacoes"
                placeholder="Observações (opcional)"
                rows={3}
                className="rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="w-fit rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
              >
                Concluir Serviço
              </button>
            </form>
          </section>
        )}

      {manutencao.status === "CONCLUIDA" && manutencao.conclusaoServico && (
        <section className="mb-6 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-green-900 dark:text-green-300">
              Serviço Concluído
            </h2>
            <form
              action={async () => {
                "use server";
                await reabrirServico(manutencao.id);
              }}
            >
              <button
                type="submit"
                className="rounded border border-orange-300 dark:border-orange-700 px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950"
              >
                Reabrir serviço
              </button>
            </form>
          </div>
          <p className="text-sm text-green-800 dark:text-green-400">
            Em{" "}
            {manutencao.conclusaoServico.dataConclusao.toLocaleString(
              "pt-BR"
            )}
          </p>
          {manutencao.conclusaoServico.observacoes && (
            <p className="mt-1 text-sm text-green-800 dark:text-green-400">
              {manutencao.conclusaoServico.observacoes}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
