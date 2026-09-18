import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  formatData,
  diasEntreDatas,
  parseDataLocal,
  formatMesCompetencia,
  hojeSaoPaulo,
} from "@/lib/datahora";
import { formatEndereco } from "@/lib/endereco";
import { formatMoedaExibicao } from "@/lib/masks";
import { calcularMulta } from "@/lib/multa";
import { valoresAdequacao } from "@/lib/adequacoes";
import {
  LABEL_TIPO_FIANCA,
  LABEL_FORMA_AVISO,
  LABEL_FORMA_CONTATO,
  LABEL_PARTE_JURIDICA,
  LABEL_MEIO_NOTIFICACAO,
  LABEL_FASE_JURIDICA,
} from "@/lib/labels";
import AbasDistrato from "@/components/distrato/AbasDistrato";
import ArquivoPreviewBotao from "@/components/distrato/ArquivoPreviewBotao";
import ExcluirBotao from "@/components/distrato/ExcluirBotao";
import ImpressaoModal from "@/components/ImpressaoModal";
import TratativaModal from "@/components/juridico/TratativaModal";
import NotificacaoModal from "@/components/juridico/NotificacaoModal";
import EnviarExecucaoBotao from "@/components/juridico/EnviarExecucaoBotao";
import RelatorioJuridicoDocumento from "@/components/juridico/RelatorioJuridicoDocumento";
import {
  registrarTratativa,
  excluirTratativa,
  registrarNotificacao,
  excluirNotificacao,
  enviarParaExecucao,
} from "../actions";

const SECAO_CLASSE =
  "mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6";

function LinhaEvento({ titulo, detalhe }: { titulo: string; detalhe: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 py-2 text-sm last:border-0">
      <span className="text-slate-700 dark:text-slate-300">{titulo}</span>
      <span className="text-slate-500 dark:text-slate-400">{detalhe}</span>
    </div>
  );
}

export default async function DossieJuridicoPage({
  params,
}: {
  params: Promise<{ distratoId: string }>;
}) {
  const { distratoId } = await params;
  const hoje = hojeSaoPaulo();

  const distrato = await prisma.distrato.findUnique({
    where: { id: distratoId },
    include: {
      processo: { include: { partes: true } },
      avisoPrevio: true,
      comunicadoLocador: true,
      contatos: { orderBy: { data: "asc" } },
      entregaChaves: true,
      agendamentoVistoria: true,
      comunicadoVistoria: true,
      vistoriaSaida: true,
      laudoVistoria: true,
      comunicadoEncerramentoLocador: true,
      comunicadoEncerramentoLocatario: true,
      aluguel: true,
      lancamentosFinanceiros: { orderBy: { mesCompetencia: "asc" } },
      decisaoAdequacao: true,
      adequacoes: {
        include: {
          pedidosOrcamento: {
            select: {
              status: true,
              valorMaoDeObra: true,
              valorMaterial: true,
              percentualAdministracao: true,
            },
          },
          pagamentos: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
      acordo: {
        include: {
          criadoPor: { select: { nome: true } },
          parcelas: {
            orderBy: { numero: "asc" },
            include: { cobrancas: { orderBy: { data: "desc" } } },
          },
        },
      },
      enviadoJuridicoPor: { select: { nome: true } },
      tratativasJuridicas: {
        orderBy: { data: "desc" },
        include: { criadoPor: { select: { nome: true } } },
      },
      notificacoesJuridicas: {
        orderBy: { data: "desc" },
        include: { criadoPor: { select: { nome: true } } },
      },
    },
  });

  if (!distrato || !distrato.enviadoJuridico) notFound();

  const { processo, acordo } = distrato;
  const locadores = processo.partes.filter((p) => p.tipo === "LOCADOR");
  const locatarios = processo.partes.filter((p) => p.tipo === "LOCATARIO");

  const primeiroContato =
    distrato.contatos.length > 0
      ? distrato.contatos.reduce((min, c) => (c.data < min.data ? c : min))
      : null;

  // Valores em aberto
  const TIPOS_LANCAMENTO: { tipo: string; titulo: string }[] = [
    { tipo: "ALUGUEL", titulo: "Aluguéis" },
    { tipo: "AGUA", titulo: "Água" },
    { tipo: "ENERGIA", titulo: "Energia" },
    { tipo: "IPTU", titulo: "IPTU" },
    { tipo: "CONDOMINIO", titulo: "Condomínio" },
  ];
  const categoriasLancamento = TIPOS_LANCAMENTO.map(({ tipo, titulo }) => ({
    titulo,
    itens: distrato.lancamentosFinanceiros.filter((l) => l.tipo === tipo),
    total: distrato.lancamentosFinanceiros
      .filter((l) => l.tipo === tipo)
      .reduce((soma, l) => soma + l.valor, 0),
  })).filter((c) => c.itens.length > 0);

  const adequacoesLocatario = distrato.adequacoes.filter((a) => a.competencia === "LOCATARIO");
  const totalAdequacoes = adequacoesLocatario.reduce((soma, a) => {
    const { valorPrestador, valorAdministracao } = valoresAdequacao(a);
    return soma + (valorPrestador ?? 0) + valorAdministracao;
  }, 0);

  const dataReferenciaMulta = distrato.avisoPrevio
    ? distrato.avisoPrevio.data
    : parseDataLocal(new Date().toISOString().slice(0, 10));
  const resultadoMulta = distrato.aluguel
    ? calcularMulta({
        valorAluguel: distrato.aluguel.valor,
        tipoFianca: processo.tipoFianca,
        prazoContratoMeses: processo.prazoContratoMeses,
        prazoMultaMeses: processo.prazoMultaMeses,
        dataInicio: processo.prazoContratoInicio,
        dataReferencia: dataReferenciaMulta,
        infracaoContratual: distrato.aluguel.infracaoContratual,
      })
    : null;
  const tituloMulta = distrato.aluguel
    ? distrato.aluguel.infracaoContratual
      ? "Multa por Infração Contratual"
      : "Multa por Distrato"
    : null;

  const totalLancamentos = distrato.lancamentosFinanceiros.reduce((s, l) => s + l.valor, 0);
  const totalGeralAberto =
    totalLancamentos + totalAdequacoes + (resultadoMulta?.multaAtual ?? 0);

  const agora = new Date();

  const conteudoAnalise = (
    <>
      <section className={SECAO_CLASSE}>
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Dados do Processo
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400 dark:text-slate-500">Unidade</p>
            <p className="text-slate-700 dark:text-slate-300">{processo.unidade || "—"}</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500">Código do Imóvel</p>
            <p className="text-slate-700 dark:text-slate-300">{processo.codigoImovel || "—"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-slate-400 dark:text-slate-500">Endereço do Imóvel</p>
            <p className="text-slate-700 dark:text-slate-300">{formatEndereco(processo)}</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500">Garantia</p>
            <p className="text-slate-700 dark:text-slate-300">
              {processo.tipoFianca ? LABEL_TIPO_FIANCA[processo.tipoFianca] : "—"}
              {processo.fiancaNome ? ` — ${processo.fiancaNome}` : ""}
            </p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500">Prazo do Contrato</p>
            <p className="text-slate-700 dark:text-slate-300">
              {processo.prazoContratoMeses ? `${processo.prazoContratoMeses} meses` : "—"}
            </p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500">Locador(es)</p>
            {locadores.length > 0 ? (
              locadores.map((l) => (
                <p key={l.id} className="text-slate-700 dark:text-slate-300">
                  {l.nome} — {l.telefone}
                </p>
              ))
            ) : (
              <p className="text-slate-700 dark:text-slate-300">—</p>
            )}
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500">Locatário(s)</p>
            {locatarios.length > 0 ? (
              locatarios.map((l) => (
                <p key={l.id} className="text-slate-700 dark:text-slate-300">
                  {l.nome} — {l.telefone}
                </p>
              ))
            ) : (
              <p className="text-slate-700 dark:text-slate-300">—</p>
            )}
          </div>
        </div>
      </section>

      <section className={SECAO_CLASSE}>
        <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Linha do Tempo
        </h2>
        <LinhaEvento
          titulo="Aviso Prévio do Locatário"
          detalhe={
            distrato.avisoPrevio
              ? `${formatData(distrato.avisoPrevio.data)} — ${LABEL_FORMA_AVISO[distrato.avisoPrevio.forma]}`
              : "Não registrado"
          }
        />
        <LinhaEvento
          titulo="Comunicado ao Locador"
          detalhe={
            distrato.comunicadoLocador
              ? formatData(distrato.comunicadoLocador.data)
              : "Não registrado"
          }
        />
        <LinhaEvento
          titulo="Acompanhamento do Aviso Prévio"
          detalhe={primeiroContato ? formatData(primeiroContato.data) : "Nenhum contato registrado"}
        />
        <LinhaEvento
          titulo="Entrega de Chaves"
          detalhe={
            distrato.entregaChaves ? formatData(distrato.entregaChaves.data) : "Não registrada"
          }
        />
        <LinhaEvento
          titulo="Comunicado da Vistoria"
          detalhe={
            distrato.comunicadoVistoria?.data
              ? formatData(distrato.comunicadoVistoria.data)
              : "Não registrado"
          }
        />
        <LinhaEvento
          titulo="Vistoria de Saída"
          detalhe={
            distrato.vistoriaSaida ? formatData(distrato.vistoriaSaida.data) : "Não registrada"
          }
        />
        <LinhaEvento
          titulo="Laudo de Vistoria"
          detalhe={
            distrato.laudoVistoria ? formatData(distrato.laudoVistoria.data) : "Não registrado"
          }
        />
        <LinhaEvento
          titulo="Comunicado de Encerramento ao Locador"
          detalhe={
            distrato.comunicadoEncerramentoLocador
              ? formatData(distrato.comunicadoEncerramentoLocador.data)
              : "Não registrado"
          }
        />
        <LinhaEvento
          titulo="Comunicado de Encerramento ao Locatário"
          detalhe={
            distrato.comunicadoEncerramentoLocatario
              ? formatData(distrato.comunicadoEncerramentoLocatario.data)
              : "Não registrado"
          }
        />
      </section>

      <section className={SECAO_CLASSE}>
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Valores em Aberto
        </h2>
        {categoriasLancamento.map((cat) => (
          <div key={cat.titulo} className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {cat.titulo}
            </p>
            <table className="w-full text-sm">
              <tbody>
                {cat.itens.map((l) => (
                  <tr key={l.id}>
                    <td className="py-0.5 pr-4 text-slate-600 dark:text-slate-400">
                      {l.nomeServico ? `${l.nomeServico} — ` : ""}
                      {formatMesCompetencia(l.mesCompetencia)}
                      {l.periodoDias ? ` (${l.periodoDias} dias)` : ""}
                    </td>
                    <td className="py-0.5 text-right text-slate-700 dark:text-slate-300">
                      R$ {formatMoedaExibicao(l.valor)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-0.5 pr-4 font-semibold text-slate-900 dark:text-slate-100">
                    Subtotal
                  </td>
                  <td className="py-0.5 text-right font-semibold text-slate-900 dark:text-slate-100">
                    R$ {formatMoedaExibicao(cat.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}

        {totalAdequacoes > 0 && (
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-300">
              Adequações (custo repassado ao locatário)
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              R$ {formatMoedaExibicao(totalAdequacoes)}
            </span>
          </div>
        )}

        {resultadoMulta && resultadoMulta.multaAtual > 0 && (
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-300">{tituloMulta}</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              R$ {formatMoedaExibicao(resultadoMulta.multaAtual)}
            </span>
          </div>
        )}

        <div className="mt-4 flex justify-between border-t border-slate-200 dark:border-slate-700 pt-3 text-sm">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            Total geral em aberto
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            R$ {formatMoedaExibicao(totalGeralAberto)}
          </span>
        </div>
      </section>

      <section className={SECAO_CLASSE}>
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Acordo</h2>
        {!acordo ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum acordo registrado para este processo.
          </p>
        ) : (
          <>
            <div className="mb-4 text-sm text-slate-700 dark:text-slate-300">
              <p>Valor original: R$ {formatMoedaExibicao(acordo.valorOriginal)}</p>
              {acordo.tipoDesconto && (
                <p>
                  Desconto:{" "}
                  {acordo.tipoDesconto === "PERCENTUAL"
                    ? `${acordo.valorDesconto}%`
                    : `R$ ${formatMoedaExibicao(acordo.valorDesconto)}`}
                </p>
              )}
              {acordo.tipoJuros && (
                <p>
                  Juros:{" "}
                  {acordo.tipoJuros === "PERCENTUAL"
                    ? `${acordo.valorJuros}%`
                    : `R$ ${formatMoedaExibicao(acordo.valorJuros)}`}
                  {acordo.jurosAoMes ? " ao mês" : ""}
                </p>
              )}
              {acordo.tipoMultaAtraso && (
                <p>
                  Multa por atraso:{" "}
                  {acordo.tipoMultaAtraso === "PERCENTUAL"
                    ? `${acordo.valorMultaAtraso}%`
                    : `R$ ${formatMoedaExibicao(acordo.valorMultaAtraso)}`}{" "}
                  por parcela
                </p>
              )}
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Valor final: R$ {formatMoedaExibicao(acordo.valorFinal)} em {acordo.numeroParcelas}
                x
              </p>
              {acordo.observacoes && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {acordo.observacoes}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Registrado em {formatData(acordo.createdAt)}
                {acordo.criadoPor?.nome ? ` por ${acordo.criadoPor.nome}` : ""}
              </p>
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Parcelas
            </p>
            <ul className="flex flex-col gap-2">
              {acordo.parcelas.map((p) => {
                const diferenca = p.dataPagamento
                  ? diasEntreDatas(p.dataPagamento, p.dataVencimento)
                  : null;
                const diasVencida =
                  !p.pago && p.dataVencimento < agora
                    ? diasEntreDatas(agora, p.dataVencimento)
                    : null;

                return (
                  <li
                    key={p.id}
                    className="rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-700 dark:text-slate-300">
                        {p.numero}/{acordo.numeroParcelas} — {formatData(p.dataVencimento)} — R${" "}
                        {formatMoedaExibicao(p.valor)}
                      </span>
                      {p.pago ? (
                        <span className="rounded bg-green-50 dark:bg-green-950 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                          Paga
                        </span>
                      ) : diasVencida !== null ? (
                        <span className="rounded bg-red-50 dark:bg-red-950 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
                          Vencida há {diasVencida} {diasVencida === 1 ? "dia" : "dias"}
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                          Pendente
                        </span>
                      )}
                    </div>
                    {p.pago && p.dataPagamento && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Pago em {formatData(p.dataPagamento)}
                        {diferenca !== null &&
                          (diferenca <= 0
                            ? " — dentro do prazo"
                            : ` — ${diferenca} ${diferenca === 1 ? "dia" : "dias"} em atraso`)}
                      </p>
                    )}
                    {p.cobrancas.length > 0 && (
                      <ul className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {p.cobrancas.map((c) => (
                          <li key={c.id}>
                            Cobrança em {formatData(c.data)} — {LABEL_FORMA_CONTATO[c.forma]}
                            {c.anotacoes ? `: ${c.anotacoes}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </>
  );

  const conteudoTratativas = (
    <section className={SECAO_CLASSE}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tratativas</h2>
        <TratativaModal
          hoje={hoje}
          action={async (formData: FormData) => {
            "use server";
            await registrarTratativa(distrato.id, formData);
          }}
        />
      </div>
      <ul className="flex flex-col gap-2">
        {distrato.tratativasJuridicas.map((t) => (
          <li
            key={t.id}
            className="rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {LABEL_PARTE_JURIDICA[t.parte]} — {formatData(t.data)}
                </p>
                <p className="mt-1 text-slate-700 dark:text-slate-300">{t.descricao}</p>
                {t.arquivoUrl && (
                  <div className="mt-1">
                    <ArquivoPreviewBotao url={t.arquivoUrl} nome={t.arquivoNome} tipo={t.arquivoTipo} />
                  </div>
                )}
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {t.criadoPor?.nome ? `Registrado por ${t.criadoPor.nome}` : ""}
                </p>
              </div>
              <ExcluirBotao
                onExcluir={async () => {
                  "use server";
                  await excluirTratativa(t.id, distrato.id);
                }}
              />
            </div>
          </li>
        ))}
        {distrato.tratativasJuridicas.length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Nenhuma tratativa registrada ainda.
          </p>
        )}
      </ul>
    </section>
  );

  const conteudoNotificacoes = (
    <section className={SECAO_CLASSE}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notificações</h2>
        <div className="flex items-center gap-2">
          <NotificacaoModal
            hoje={hoje}
            action={async (formData: FormData) => {
              "use server";
              await registrarNotificacao(distrato.id, formData);
            }}
          />
          {distrato.faseJuridica !== "EXECUCAO" && (
            <EnviarExecucaoBotao
              action={async () => {
                "use server";
                await enviarParaExecucao(distrato.id);
              }}
            />
          )}
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {distrato.notificacoesJuridicas.map((n) => (
          <li
            key={n.id}
            className="rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {LABEL_PARTE_JURIDICA[n.parte]} — {LABEL_MEIO_NOTIFICACAO[n.meio]} —{" "}
                  {formatData(n.data)}
                </p>
                <p className="mt-1 text-slate-700 dark:text-slate-300">{n.descricao}</p>
                {n.arquivoUrl && (
                  <div className="mt-1">
                    <ArquivoPreviewBotao url={n.arquivoUrl} nome={n.arquivoNome} tipo={n.arquivoTipo} />
                  </div>
                )}
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {n.criadoPor?.nome ? `Registrado por ${n.criadoPor.nome}` : ""}
                </p>
              </div>
              <ExcluirBotao
                onExcluir={async () => {
                  "use server";
                  await excluirNotificacao(n.id, distrato.id);
                }}
              />
            </div>
          </li>
        ))}
        {distrato.notificacoesJuridicas.length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Nenhuma notificação registrada ainda.
          </p>
        )}
      </ul>
    </section>
  );

  const conteudoExecucao = (
    <section className={SECAO_CLASSE}>
      <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Execução</h2>
      <p className="mb-4 text-sm text-slate-700 dark:text-slate-300">
        Fase atual: <span className="font-medium">{LABEL_FASE_JURIDICA[distrato.faseJuridica]}</span>
      </p>
      {distrato.faseJuridica !== "EXECUCAO" ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Esse processo ainda não foi enviado para a fase de Execução. Use o botão na aba
          Notificações quando estiver pronto.
        </p>
      ) : (
        <ImpressaoModal label="Gerar Relatório Completo">
          <RelatorioJuridicoDocumento
            numeroProcesso={processo.numeroProcesso}
            endereco={formatEndereco(processo)}
            locadores={locadores.map((l) => ({ nome: l.nome, telefone: l.telefone }))}
            locatarios={locatarios.map((l) => ({ nome: l.nome, telefone: l.telefone }))}
            eventos={[
              {
                titulo: "Aviso Prévio do Locatário",
                data: distrato.avisoPrevio?.data ?? null,
              },
              { titulo: "Comunicado ao Locador", data: distrato.comunicadoLocador?.data ?? null },
              { titulo: "Acompanhamento do Aviso Prévio", data: primeiroContato?.data ?? null },
              { titulo: "Entrega de Chaves", data: distrato.entregaChaves?.data ?? null },
              { titulo: "Comunicado da Vistoria", data: distrato.comunicadoVistoria?.data ?? null },
              { titulo: "Vistoria de Saída", data: distrato.vistoriaSaida?.data ?? null },
              { titulo: "Laudo de Vistoria", data: distrato.laudoVistoria?.data ?? null },
              {
                titulo: "Comunicado de Encerramento ao Locador",
                data: distrato.comunicadoEncerramentoLocador?.data ?? null,
              },
              {
                titulo: "Comunicado de Encerramento ao Locatário",
                data: distrato.comunicadoEncerramentoLocatario?.data ?? null,
              },
            ]}
            categoriasLancamento={categoriasLancamento}
            totalAdequacoes={totalAdequacoes}
            tituloMulta={tituloMulta}
            valorMulta={resultadoMulta?.multaAtual ?? null}
            totalGeralAberto={totalGeralAberto}
            acordo={
              acordo
                ? {
                    valorOriginal: acordo.valorOriginal,
                    valorFinal: acordo.valorFinal,
                    numeroParcelas: acordo.numeroParcelas,
                    parcelas: acordo.parcelas.map((p) => ({
                      numero: p.numero,
                      dataVencimento: p.dataVencimento,
                      valor: p.valor,
                      pago: p.pago,
                      dataPagamento: p.dataPagamento,
                    })),
                  }
                : null
            }
            tratativas={distrato.tratativasJuridicas.map((t) => ({
              parte: t.parte,
              data: t.data,
              descricao: t.descricao,
            }))}
            notificacoes={distrato.notificacoesJuridicas.map((n) => ({
              parte: n.parte,
              meio: n.meio,
              data: n.data,
              descricao: n.descricao,
            }))}
          />
        </ImpressaoModal>
      )}
    </section>
  );

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Dossiê Jurídico — Processo {processo.numeroProcesso}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enviado ao Jurídico em{" "}
            {distrato.dataEnvioJuridico ? formatData(distrato.dataEnvioJuridico) : "—"}
            {distrato.enviadoJuridicoPor?.nome ? ` por ${distrato.enviadoJuridicoPor.nome}` : ""}
          </p>
        </div>
        <Link
          href={`/distrato/${distrato.id}`}
          className="rounded border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Ver processo completo
        </Link>
      </div>

      {distrato.motivoJuridico && (
        <div className="mb-6 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4 text-sm text-amber-700 dark:text-amber-400">
          <p className="mb-1 font-semibold">Motivo do envio</p>
          <p>{distrato.motivoJuridico}</p>
        </div>
      )}

      <AbasDistrato
        abas={[
          { id: "analise", label: "Análise", content: conteudoAnalise },
          { id: "tratativas", label: "Tratativas", content: conteudoTratativas },
          { id: "notificacoes", label: "Notificações", content: conteudoNotificacoes },
          { id: "execucao", label: "Execução", content: conteudoExecucao },
        ]}
      />
    </div>
  );
}
