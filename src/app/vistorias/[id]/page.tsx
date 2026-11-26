import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEndereco } from "@/lib/endereco";
import { formatData, formatDataHora, hojeSaoPaulo, parseDataLocal } from "@/lib/datahora";
import { formatMoedaExibicao } from "@/lib/masks";
import { podeEntregarVistoria } from "@/lib/perfis";
import { LABEL_TIPO_VISTORIA, prazoVistoria, situacaoVistoria } from "@/lib/vistorias";
import { concluirVistoria } from "../actions";
import ArquivoPreviewBotao from "@/components/distrato/ArquivoPreviewBotao";
import ConcluirVistoriaModal from "@/components/vistorias/ConcluirVistoriaModal";

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-400 dark:text-slate-500">{rotulo}</dt>
      <dd className="text-sm text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  );
}

export default async function SolicitacaoVistoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const role = session?.user.role;
  const podeEntregar = podeEntregarVistoria(role);
  const podeVerDistrato = role === "ADMIN" || role === "ADMINISTRATIVO";

  const v = await prisma.vistoria.findUnique({
    where: { id },
    include: {
      processo: true,
      solicitadoPor: { select: { nome: true } },
      entreguePor: { select: { nome: true } },
    },
  });
  // Solicitação cancelada ou excluída: um aviso antigo não deve levar a uma página de erro.
  if (!v) redirect("/vistorias/entrada");

  const hojeStr = hojeSaoPaulo();
  const situacao = situacaoVistoria(v, parseDataLocal(hojeStr));
  const tipoLabel = LABEL_TIPO_VISTORIA[v.tipo];
  const entregue = v.status === "ENTREGUE";
  const listaHref = `/vistorias/${v.tipo === "SAIDA" ? "saida" : "entrada"}`;

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <Link href={listaHref} className="text-slate-500 underline dark:text-slate-400">
          ← Vistorias de {tipoLabel}
        </Link>
        {podeEntregar && (
          <Link
            href="/vistorias/solicitacoes"
            className="text-slate-500 underline dark:text-slate-400"
          >
            Quadro de Solicitações
          </Link>
        )}
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Vistoria de {tipoLabel} — {v.processo.numeroProcesso}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{formatEndereco(v.processo)}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${situacao.cor}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {situacao.rotulo}
        </span>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Solicitada em">
            {formatDataHora(v.createdAt)} por {v.solicitadoPor.nome}
          </Campo>
          <Campo rotulo="Entregar até">{formatData(prazoVistoria(v))}</Campo>
          {v.agendadaPara && (
            <Campo rotulo="Agendada para">
              {formatData(v.agendadaPara)}
              {v.horaAgendada ? ` às ${v.horaAgendada}` : ""}
            </Campo>
          )}
          <Campo rotulo="Valor do aluguel">
            {v.processo.valorAluguel ? `R$ ${formatMoedaExibicao(v.processo.valorAluguel)}` : "—"}
          </Campo>
          {v.tipo === "SAIDA" && (
            <Campo rotulo="Desejam participar">
              {[v.locadorDesejaParticipar && "Locador", v.locatarioDesejaParticipar && "Locatário"]
                .filter(Boolean)
                .join(" e ") || "Ninguém informado"}
            </Campo>
          )}
          {entregue && v.entregueData && (
            <Campo rotulo="Concluída em">
              {formatData(v.entregueData)}
              {v.entregueHora ? ` às ${v.entregueHora}` : ""}
              {v.entreguePor ? ` por ${v.entreguePor.nome}` : ""}
            </Campo>
          )}
          {entregue && v.tipo === "SAIDA" && (
            <Campo rotulo="Participaram">
              {[v.locadorParticipou && "Locador", v.locatarioParticipou && "Locatário"]
                .filter(Boolean)
                .join(" e ") || "Ninguém"}
            </Campo>
          )}
        </dl>

        {v.descricaoConclusao && (
          <div className="mt-4">
            <p className="text-xs text-slate-400 dark:text-slate-500">Descrição da conclusão</p>
            <p className="whitespace-pre-line text-sm text-slate-900 dark:text-slate-100">
              {v.descricaoConclusao}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            {v.comprovanteUrl && (
              <ArquivoPreviewBotao
                url={v.comprovanteUrl}
                nome={v.comprovanteNome}
                tipo={v.comprovanteTipo}
                label="Ver comprovante do sinal"
              />
            )}
            {v.distratoId && podeVerDistrato && (
              <Link
                href={`/distrato/${v.distratoId}`}
                className="text-sm text-slate-500 underline dark:text-slate-400"
              >
                Ver distrato
              </Link>
            )}
          </div>
          {!entregue && podeEntregar && (
            <ConcluirVistoriaModal
              hoje={hojeStr}
              participacao={v.tipo === "SAIDA"}
              action={async (formData: FormData) => {
                "use server";
                await concluirVistoria(id, formData);
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}
