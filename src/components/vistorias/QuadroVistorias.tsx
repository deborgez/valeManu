import Link from "next/link";
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
import TabelaLista, { type LinhaLista } from "@/components/TabelaLista";

export default async function QuadroVistorias({ tipo }: { tipo: "ENTRADA" | "SAIDA" }) {
  const session = await auth();
  const role = session?.user.role;
  const podeSolicitar = podeSolicitarVistoria(role);
  const podeEntregar = podeEntregarVistoria(role);
  const podeVerDistrato = role === "ADMIN" || role === "ADMINISTRATIVO";
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

  const itens: LinhaLista[] = vistorias.map((v) => {
    const situacao = situacaoVistoria(v, hoje);
    return {
      id: v.id,
      busca: [
        v.processo.numeroProcesso,
        formatEndereco(v.processo),
        v.solicitadoPor.nome,
        v.entreguePor?.nome ?? "",
        situacao.texto,
      ].join(" "),
      ordenar: {
        imovel: v.processo.numeroProcesso,
        valor: v.processo.valorAluguel ?? 0,
        solicitada: v.createdAt.getTime(),
        prazo: prazoVistoria(v).getTime(),
        situacao: v.status === "ENTREGUE" ? "2" : "1",
      },
      linha: (
        <tr key={v.id} className="border-t border-slate-100 dark:border-slate-700 align-top">
          <td className="px-4 py-2">
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {v.processo.numeroProcesso}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatEndereco(v.processo)}
            </p>
            {v.tipo === "SAIDA" && (v.locadorDesejaParticipar || v.locatarioDesejaParticipar) && (
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {[v.locadorDesejaParticipar && "Locador deseja participar", v.locatarioDesejaParticipar && "Locatário deseja participar"]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {v.tipo === "SAIDA" && v.status === "ENTREGUE" && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Participaram:{" "}
                {[v.locadorParticipou && "locador", v.locatarioParticipou && "locatário"]
                  .filter(Boolean)
                  .join(" e ") || "ninguém"}
              </p>
            )}
            {v.distratoId && podeVerDistrato && (
              <Link
                href={`/distrato/${v.distratoId}`}
                className="text-xs text-slate-500 dark:text-slate-400 underline"
              >
                Ver distrato
              </Link>
            )}
          </td>
          <td className="whitespace-nowrap px-4 py-2">
            {v.processo.valorAluguel ? `R$ ${formatMoedaExibicao(v.processo.valorAluguel)}` : "—"}
          </td>
          <td className="px-4 py-2">
            {formatData(v.createdAt)}
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {v.solicitadoPor.nome}
            </p>
            {v.agendadaPara && (
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Agendada para {formatData(v.agendadaPara)}
                {v.horaAgendada ? ` às ${v.horaAgendada}` : ""}
              </p>
            )}
          </td>
          <td className="whitespace-nowrap px-4 py-2">
            {formatData(prazoVistoria(v))}
          </td>
          <td className="min-w-[13rem] px-4 py-2">
            <span
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${situacao.cor}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {situacao.rotulo}
            </span>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{situacao.detalhe}</p>
            {v.descricaoConclusao && (
              <p className="mt-1 whitespace-pre-line text-xs text-slate-600 dark:text-slate-300">
                {v.descricaoConclusao}
              </p>
            )}
            {v.status === "ENTREGUE" && v.entregueHora && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                às {v.entregueHora}
                {v.entreguePor ? ` · ${v.entreguePor.nome}` : ""}
              </p>
            )}
          </td>
          {tipo === "ENTRADA" && (
            <td className="px-4 py-2">
              {v.comprovanteUrl ? (
                <ArquivoPreviewBotao
                  url={v.comprovanteUrl}
                  nome={v.comprovanteNome}
                  tipo={v.comprovanteTipo}
                  label="Ver comprovante"
                />
              ) : (
                <span className="text-slate-400 dark:text-slate-500">—</span>
              )}
            </td>
          )}
          {podeEntregar && (
            <td className="px-4 py-2 text-right">
              {v.status === "PENDENTE" && (
                <ConcluirVistoriaModal
                  hoje={hojeStr}
                  participacao={v.tipo === "SAIDA"}
                  action={async (formData: FormData) => {
                    "use server";
                    await concluirVistoria(v.id, formData);
                  }}
                />
              )}
            </td>
          )}
        </tr>
      ),
    };
  });

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Vistorias de {tipoLabel}
        </h1>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/exportar/vistorias"
          className="ml-auto mr-2 rounded border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Exportar planilha
        </a>
        {podeSolicitar && tipo === "ENTRADA" && (
          <NovaVistoriaModal
            hoje={hojeStr}
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

      {tipo === "SAIDA" && (
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          A vistoria de saída é solicitada pelo Distrato, na aba Relacionamento.
        </p>
      )}

      <TabelaLista
        linhas={itens}
        vazio={`Nenhuma vistoria de ${tipoLabel.toLowerCase()} solicitada ainda.`}
        placeholderBusca="Buscar por processo, endereço, solicitante ou situação"
        ordemInicial={{ chave: "solicitada", direcao: "desc" }}
        colunas={[
          { chave: "imovel", rotulo: "Imóvel", ordenavel: true },
          { chave: "valor", rotulo: "Valor", ordenavel: true },
          { chave: "solicitada", rotulo: "Solicitada em", ordenavel: true },
          { chave: "prazo", rotulo: "Prazo", ordenavel: true },
          { chave: "situacao", rotulo: "Situação", ordenavel: true },
          ...(tipo === "ENTRADA" ? [{ chave: "sinal", rotulo: "Sinal" }] : []),
          ...(podeEntregar ? [{ chave: "acoes", rotulo: "" }] : []),
        ]}
      />
      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
        Prazo de entrega: 5 dias úteis a partir da data de solicitação. Atualizado em{" "}
        {formatDataHora(new Date())}.
      </p>
    </div>
  );
}
