import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatEndereco } from "@/lib/endereco";
import { formatData, formatSistema, diasEntreDatas, hojeSaoPaulo } from "@/lib/datahora";
import {
  LABEL_TIPO_FIANCA,
  LABEL_FORMA_AVISO,
  LABEL_FORMA_CONTATO,
  LABEL_MANUTENCAO_STATUS,
} from "@/lib/labels";
import Link from "next/link";
import { diasEmAberto, classificarSeveridade } from "@/lib/tempo";
import AvisoPrevioModal from "@/components/distrato/AvisoPrevioModal";
import ComunicadoModal from "@/components/distrato/ComunicadoModal";
import ContatoModal from "@/components/distrato/ContatoModal";
import LocalEntregaChavesForm from "@/components/distrato/LocalEntregaChavesForm";
import EntregaChavesModal from "@/components/distrato/EntregaChavesModal";
import AgendamentoVistoriaModal from "@/components/distrato/AgendamentoVistoriaModal";
import ComunicadoVistoriaModal from "@/components/distrato/ComunicadoVistoriaModal";
import VistoriaSaidaModal from "@/components/distrato/VistoriaSaidaModal";
import LaudoVistoriaModal from "@/components/distrato/LaudoVistoriaModal";
import ExcluirBotao from "@/components/distrato/ExcluirBotao";
import ArquivoPreviewBotao from "@/components/distrato/ArquivoPreviewBotao";
import AuditoriaButton from "@/components/distrato/AuditoriaButton";
import AbasDistrato from "@/components/distrato/AbasDistrato";
import AdequacoesForm from "@/components/distrato/AdequacoesForm";
import NovaAdequacaoModal from "@/components/distrato/NovaAdequacaoModal";
import {
  registrarAvisoPrevio,
  editarAvisoPrevio,
  excluirAvisoPrevio,
  registrarComunicado,
  editarComunicado,
  excluirComunicado,
  registrarContato,
  editarContato,
  excluirContato,
  definirLocalEntregaChaves,
  registrarEntregaChaves,
  editarEntregaChaves,
  excluirEntregaChaves,
  agendarVistoriaSaida,
  editarAgendamentoVistoria,
  excluirAgendamentoVistoria,
  registrarComunicadoVistoria,
  editarComunicadoVistoria,
  excluirComunicadoVistoria,
  registrarVistoriaSaida,
  editarVistoriaSaida,
  excluirVistoriaSaida,
  registrarLaudoVistoria,
  editarLaudoVistoria,
  excluirLaudoVistoria,
  registrarComunicadoEncerramentoLocador,
  editarComunicadoEncerramentoLocador,
  excluirComunicadoEncerramentoLocador,
  registrarComunicadoEncerramentoLocatario,
  editarComunicadoEncerramentoLocatario,
  excluirComunicadoEncerramentoLocatario,
  registrarDecisaoAdequacao,
  excluirDecisaoAdequacao,
  criarAdequacao,
} from "../actions";

const SECAO_CLASSE =
  "mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6";

function InfoSistema({ data, usuario }: { data: Date; usuario?: string | null }) {
  return (
    <p className="mt-1 text-right text-[10px] text-slate-400 dark:text-slate-500">
      {usuario && <span className="font-bold italic">{usuario}</span>}
      {usuario ? " — " : ""}
      <span className="italic">{formatSistema(data)}</span>
    </p>
  );
}

function SecaoTitulo({
  titulo,
  auditoria,
}: {
  titulo: string;
  auditoria: {
    id: string;
    acao: string;
    detalhe: string | null;
    createdAt: Date;
    usuario: { nome: string };
  }[];
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{titulo}</h2>
      <AuditoriaButton entradas={auditoria} />
    </div>
  );
}

function Divisor({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">{children}</div>
  );
}

function etapaAdequacao(a: {
  status: string;
  pedidosOrcamento: { id: string }[];
  inicioServicos: { status: string }[];
  pagamentos: { status: string }[];
}): string {
  if (a.status === "CONCLUIDA") {
    return a.pagamentos[0]?.status === "PAGO" ? "Pagamento efetuado" : "Serviço concluído";
  }
  if (a.status === "SOLICITACAO") return "Solicitação";
  if (a.status === "AGUARDANDO_ORCAMENTO") {
    return a.pedidosOrcamento.length === 0 ? "Pedido de orçamento" : "Entrega de orçamento";
  }
  if (a.status === "AGUARDANDO_APROVACAO") return "Aprovação do serviço";
  if (a.status === "APROVADA" || a.status === "AGENDADA" || a.status === "EM_ANDAMENTO") {
    if (a.inicioServicos[0]?.status === "AGENDADO") return "Início do serviço — agendado";
    if (a.inicioServicos[0]?.status === "INICIADO_ANDAMENTO") return "Início do serviço — em andamento";
    return "Início do serviço";
  }
  return LABEL_MANUTENCAO_STATUS[a.status] ?? a.status;
}

function ConteudoEmBreve({ titulo }: { titulo: string }) {
  return (
    <section className={SECAO_CLASSE}>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Nenhuma informação de {titulo} registrada ainda.
      </p>
    </section>
  );
}

export default async function DistratoDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erroComunicado?: string; erroComunicadoVistoria?: string }>;
}) {
  const { id } = await params;
  const { erroComunicado, erroComunicadoVistoria } = await searchParams;

  const distrato = await prisma.distrato.findUnique({
    where: { id },
    include: {
      processo: { include: { partes: true } },
      avisoPrevio: { include: { criadoPor: { select: { nome: true } } } },
      comunicadoLocador: { include: { criadoPor: { select: { nome: true } } } },
      contatos: {
        orderBy: { data: "desc" },
        include: { criadoPor: { select: { nome: true } } },
      },
      entregaChaves: { include: { criadoPor: { select: { nome: true } } } },
      agendamentoVistoria: { include: { criadoPor: { select: { nome: true } } } },
      comunicadoVistoria: { include: { criadoPor: { select: { nome: true } } } },
      vistoriaSaida: { include: { criadoPor: { select: { nome: true } } } },
      laudoVistoria: { include: { criadoPor: { select: { nome: true } } } },
      comunicadoEncerramentoLocador: { include: { criadoPor: { select: { nome: true } } } },
      comunicadoEncerramentoLocatario: { include: { criadoPor: { select: { nome: true } } } },
      decisaoAdequacao: { include: { criadoPor: { select: { nome: true } } } },
      adequacoes: {
        orderBy: { createdAt: "desc" },
        include: {
          inicioServicos: { orderBy: { createdAt: "desc" }, take: 1 },
          pedidosOrcamento: { select: { id: true } },
          pagamentos: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
      auditorias: {
        orderBy: { createdAt: "desc" },
        include: { usuario: { select: { nome: true } } },
      },
    },
  });

  if (!distrato) notFound();

  const hoje = hojeSaoPaulo();
  const { processo } = distrato;
  const locadores = processo.partes.filter((p) => p.tipo === "LOCADOR");
  const locatarios = processo.partes.filter((p) => p.tipo === "LOCATARIO");

  const podeComunicado = Boolean(distrato.avisoPrevio);
  const podeAcompanhamento = Boolean(distrato.comunicadoLocador);

  const ramoImobiliaria = distrato.localEntregaChaves === "IMOBILIARIA";
  const ramoImovel = distrato.localEntregaChaves === "IMOVEL";
  const podeEntregaChaves = ramoImobiliaria;
  const podeAgendamento = ramoImobiliaria && Boolean(distrato.entregaChaves);
  const podeComunicadoVistoria =
    ramoImovel || (ramoImobiliaria && Boolean(distrato.agendamentoVistoria));
  const podeVistoria = Boolean(distrato.comunicadoVistoria);
  const podeLaudo = Boolean(distrato.vistoriaSaida);
  const podeComunicadoEncerramentoLocador = Boolean(distrato.laudoVistoria);
  const podeComunicadoEncerramentoLocatario = Boolean(
    distrato.comunicadoEncerramentoLocador
  );
  const concluido = Boolean(distrato.comunicadoEncerramentoLocatario);

  const auditoriaPorSecao = (secao: string) =>
    distrato.auditorias.filter((a) => a.secao === secao);

  let alertaContato: string | null = null;
  if (distrato.avisoPrevio) {
    const prazoLimite = new Date(distrato.avisoPrevio.data);
    prazoLimite.setDate(prazoLimite.getDate() + 15);

    if (distrato.contatos.length === 0) {
      const hoje = new Date();
      if (hoje > prazoLimite) {
        alertaContato = "Alerta, nenhum contato registrado dentro do prazo.";
      }
    } else {
      const primeiroContato = distrato.contatos.reduce((min, c) =>
        c.data < min.data ? c : min
      );
      if (primeiroContato.data > prazoLimite) {
        const dias = diasEntreDatas(primeiroContato.data, prazoLimite);
        alertaContato = `Contato realizado ${dias} ${dias === 1 ? "dia" : "dias"} após o prazo máximo.`;
      }
    }
  }

  const cabecalhoProcesso = (
    <>
      {/* Dados importados do processo */}
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
            <p className="text-slate-400 dark:text-slate-500">Captador</p>
            <p className="text-slate-700 dark:text-slate-300">{processo.captador || "—"}</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500">Garantia</p>
            <p className="text-slate-700 dark:text-slate-300">
              {processo.tipoFianca ? LABEL_TIPO_FIANCA[processo.tipoFianca] : "—"}
              {processo.fiancaNome ? ` — ${processo.fiancaNome}` : ""}
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
    </>
  );

  const relacionamentoConteudo = (
    <>
      {/* Aviso Prévio do Locatário + Comunicado ao Locador */}
      <section className={SECAO_CLASSE}>
        <SecaoTitulo
          titulo="Aviso Prévio do Locatário"
          auditoria={auditoriaPorSecao("AVISO_PREVIO")}
        />
        {!distrato.avisoPrevio ? (
          <AvisoPrevioModal
            hoje={hoje}
            action={async (formData: FormData) => {
              "use server";
              await registrarAvisoPrevio(distrato.id, formData);
            }}
          />
        ) : (
          <div className="text-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-slate-700 dark:text-slate-300">
                  Data: {formatData(distrato.avisoPrevio.data)} — Forma:{" "}
                  {LABEL_FORMA_AVISO[distrato.avisoPrevio.forma]}
                </p>
                {distrato.avisoPrevio.arquivoUrl && (
                  <ArquivoPreviewBotao
                    url={distrato.avisoPrevio.arquivoUrl}
                    nome={distrato.avisoPrevio.arquivoNome}
                    tipo={distrato.avisoPrevio.arquivoTipo}
                  />
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <AvisoPrevioModal
                  registro={distrato.avisoPrevio}
                  hoje={hoje}
                  action={async (formData: FormData) => {
                    "use server";
                    await editarAvisoPrevio(distrato.id, formData);
                  }}
                />
                <ExcluirBotao
                  onExcluir={async () => {
                    "use server";
                    await excluirAvisoPrevio(distrato.id);
                  }}
                />
              </div>
            </div>
            <InfoSistema
              data={distrato.avisoPrevio.createdAt}
              usuario={distrato.avisoPrevio.criadoPor?.nome}
            />
          </div>
        )}

        {podeComunicado && (
          <Divisor>
            <SecaoTitulo
              titulo="Comunicado ao Locador"
              auditoria={auditoriaPorSecao("COMUNICADO")}
            />
            {erroComunicado && (
              <p className="mb-4 rounded bg-red-50 dark:bg-red-950 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                Não é possível registrar uma data anterior à do Aviso Prévio.
              </p>
            )}
            {!distrato.comunicadoLocador ? (
              <ComunicadoModal
                hoje={hoje}
                action={async (formData: FormData) => {
                  "use server";
                  await registrarComunicado(distrato.id, formData);
                }}
              />
            ) : (
              <div className="text-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-slate-700 dark:text-slate-300">
                      Data: {formatData(distrato.comunicadoLocador.data)} — Forma:{" "}
                      {LABEL_FORMA_AVISO[distrato.comunicadoLocador.forma]}
                    </p>
                    {distrato.comunicadoLocador.arquivoUrl && (
                      <ArquivoPreviewBotao
                        url={distrato.comunicadoLocador.arquivoUrl}
                        nome={distrato.comunicadoLocador.arquivoNome}
                        tipo={distrato.comunicadoLocador.arquivoTipo}
                      />
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <ComunicadoModal
                      registro={distrato.comunicadoLocador}
                      hoje={hoje}
                      action={async (formData: FormData) => {
                        "use server";
                        await editarComunicado(distrato.id, formData);
                      }}
                    />
                    <ExcluirBotao
                      onExcluir={async () => {
                        "use server";
                        await excluirComunicado(distrato.id);
                      }}
                    />
                  </div>
                </div>
                {distrato.avisoPrevio &&
                  (() => {
                    const diferenca = diasEntreDatas(
                      distrato.comunicadoLocador.data,
                      distrato.avisoPrevio.data
                    );
                    return diferenca === 0 ? (
                      <p className="mt-2 rounded bg-green-50 dark:bg-green-950 px-3 py-2 text-xs font-medium text-green-700 dark:text-green-400">
                        Comunicado no prazo.
                      </p>
                    ) : (
                      <p className="mt-2 rounded bg-amber-50 dark:bg-amber-950 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                        Comunicado {diferenca} {diferenca === 1 ? "dia" : "dias"} fora do prazo.
                      </p>
                    );
                  })()}
                <InfoSistema
                  data={distrato.comunicadoLocador.createdAt}
                  usuario={distrato.comunicadoLocador.criadoPor?.nome}
                />
              </div>
            )}
          </Divisor>
        )}
      </section>

      {/* Acompanhamento do Aviso Prévio */}
      {podeAcompanhamento && (
        <section className={SECAO_CLASSE}>
          <SecaoTitulo
            titulo="Acompanhamento do Aviso Prévio"
            auditoria={auditoriaPorSecao("ACOMPANHAMENTO")}
          />

          {alertaContato && (
            <p className="mb-4 rounded bg-red-50 dark:bg-red-950 px-3 py-2 text-xs font-medium text-red-700 dark:text-red-400">
              {alertaContato}
            </p>
          )}

          {distrato.contatos.length > 0 && (
            <ul className="mb-4 flex flex-col gap-2">
              {distrato.contatos.map((c) => (
                <li
                  key={c.id}
                  className="rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">
                        {formatData(c.data)} — {LABEL_FORMA_CONTATO[c.forma]}
                      </p>
                      {c.arquivoUrl && (
                        <ArquivoPreviewBotao url={c.arquivoUrl} nome={c.arquivoNome} tipo={c.arquivoTipo} />
                      )}
                      {(c.dataPrevistaEntregaChaves || c.dataPrevistaVistoriaSaida) && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {c.dataPrevistaEntregaChaves &&
                            `Previsão entrega de chaves: ${formatData(c.dataPrevistaEntregaChaves)}`}
                          {c.dataPrevistaEntregaChaves && c.dataPrevistaVistoriaSaida ? " · " : ""}
                          {c.dataPrevistaVistoriaSaida &&
                            `Previsão vistoria de saída: ${formatData(c.dataPrevistaVistoriaSaida)}`}
                        </p>
                      )}
                      {c.anotacoes && (
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          {c.anotacoes}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <ContatoModal
                        registro={c}
                        hoje={hoje}
                        action={async (formData: FormData) => {
                          "use server";
                          await editarContato(c.id, distrato.id, formData);
                        }}
                      />
                      <ExcluirBotao
                        onExcluir={async () => {
                          "use server";
                          await excluirContato(c.id, distrato.id);
                        }}
                      />
                    </div>
                  </div>
                  <InfoSistema data={c.data} usuario={c.criadoPor?.nome} />
                </li>
              ))}
            </ul>
          )}

          <ContatoModal
            hoje={hoje}
            action={async (formData: FormData) => {
              "use server";
              await registrarContato(distrato.id, formData);
            }}
          />
        </section>
      )}

      {/* Entrega de Chaves e Vistoria — fluxo único, condicional ao local */}
      {podeAcompanhamento && (
        <section className={SECAO_CLASSE}>
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Entrega de Chaves e Vistoria
          </h2>

          {!distrato.localEntregaChaves ? (
            <LocalEntregaChavesForm
              action={async (formData: FormData) => {
                "use server";
                await definirLocalEntregaChaves(distrato.id, formData);
              }}
            />
          ) : (
            <>
              {/* Etapa 1 · Entrega das Chaves (só no ramo Imobiliária) */}
              {podeEntregaChaves && (
                <div>
                  <SecaoTitulo
                    titulo="Entrega das Chaves"
                    auditoria={auditoriaPorSecao("ENTREGA_CHAVES")}
                  />
                  {!distrato.entregaChaves ? (
                    <EntregaChavesModal
                      hoje={hoje}
                      action={async (formData: FormData) => {
                        "use server";
                        await registrarEntregaChaves(distrato.id, formData);
                      }}
                    />
                  ) : (
                    <div className="text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-slate-700 dark:text-slate-300">
                            Data: {formatData(distrato.entregaChaves.data)}
                            {distrato.entregaChaves.hora
                              ? ` às ${distrato.entregaChaves.hora}`
                              : ""}
                          </p>
                          {distrato.entregaChaves.termoUrl && (
                            <ArquivoPreviewBotao
                              url={distrato.entregaChaves.termoUrl}
                              nome={distrato.entregaChaves.termoNome}
                              tipo={distrato.entregaChaves.termoTipo}
                              label="Ver termo"
                            />
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <EntregaChavesModal
                            registro={distrato.entregaChaves}
                            hoje={hoje}
                            action={async (formData: FormData) => {
                              "use server";
                              await editarEntregaChaves(distrato.id, formData);
                            }}
                          />
                          <ExcluirBotao
                            onExcluir={async () => {
                              "use server";
                              await excluirEntregaChaves(distrato.id);
                            }}
                          />
                        </div>
                      </div>
                      <InfoSistema
                        data={distrato.entregaChaves.createdAt}
                        usuario={distrato.entregaChaves.criadoPor?.nome}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Etapa 2 · Agendar Vistoria (só no ramo Imobiliária) */}
              {podeAgendamento && (
                <Divisor>
                  <SecaoTitulo
                    titulo="Agendamento da Vistoria"
                    auditoria={auditoriaPorSecao("AGENDAMENTO_VISTORIA")}
                  />
                  {!distrato.agendamentoVistoria ? (
                    <AgendamentoVistoriaModal
                      action={async (formData: FormData) => {
                        "use server";
                        await agendarVistoriaSaida(distrato.id, formData);
                      }}
                    />
                  ) : (
                    <div className="text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-slate-700 dark:text-slate-300">
                            Vistoria agendada para {formatData(distrato.agendamentoVistoria.data)}
                            {distrato.agendamentoVistoria.hora
                              ? ` às ${distrato.agendamentoVistoria.hora}`
                              : ""}
                          </p>
                          {distrato.agendamentoVistoria.arquivoUrl && (
                            <ArquivoPreviewBotao
                              url={distrato.agendamentoVistoria.arquivoUrl}
                              nome={distrato.agendamentoVistoria.arquivoNome}
                              tipo={distrato.agendamentoVistoria.arquivoTipo}
                            />
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <AgendamentoVistoriaModal
                            registro={distrato.agendamentoVistoria}
                            action={async (formData: FormData) => {
                              "use server";
                              await editarAgendamentoVistoria(distrato.id, formData);
                            }}
                          />
                          <ExcluirBotao
                            onExcluir={async () => {
                              "use server";
                              await excluirAgendamentoVistoria(distrato.id);
                            }}
                          />
                        </div>
                      </div>
                      <InfoSistema
                        data={distrato.agendamentoVistoria.createdAt}
                        usuario={distrato.agendamentoVistoria.criadoPor?.nome}
                      />
                    </div>
                  )}
                </Divisor>
              )}

              {/* Etapa 3 · Comunicado ao Locador (ambos os ramos) */}
              {podeComunicadoVistoria && (
                <Divisor>
                  <SecaoTitulo
                    titulo="Comunicado ao Locador"
                    auditoria={auditoriaPorSecao("COMUNICADO_VISTORIA")}
                  />
                  {erroComunicadoVistoria && (
                    <p className="mb-4 rounded bg-red-50 dark:bg-red-950 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                      Não é possível registrar uma data anterior à da Entrega das Chaves.
                    </p>
                  )}
                  {!distrato.comunicadoVistoria ? (
                    <ComunicadoVistoriaModal
                      hoje={hoje}
                      action={async (formData: FormData) => {
                        "use server";
                        await registrarComunicadoVistoria(distrato.id, formData);
                      }}
                    />
                  ) : (
                    <div className="text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-slate-700 dark:text-slate-300">
                            {distrato.comunicadoVistoria.data
                              ? `Data: ${formatData(distrato.comunicadoVistoria.data)}`
                              : "—"}
                            {distrato.comunicadoVistoria.forma
                              ? ` — Forma: ${LABEL_FORMA_CONTATO[distrato.comunicadoVistoria.forma]}`
                              : ""}
                          </p>
                          <p
                            className={
                              distrato.comunicadoVistoria.locadorDesejaParticipar
                                ? "text-green-600 dark:text-green-400"
                                : "text-amber-600 dark:text-amber-400"
                            }
                          >
                            {distrato.comunicadoVistoria.locadorDesejaParticipar
                              ? "Locador deseja participar"
                              : "Locador não deseja participar"}
                          </p>
                          {distrato.entregaChaves &&
                            distrato.comunicadoVistoria.data &&
                            (() => {
                              const diferenca = diasEntreDatas(
                                distrato.comunicadoVistoria.data!,
                                distrato.entregaChaves!.data
                              );
                              return diferenca === 0 ? (
                                <p className="mt-2 rounded bg-green-50 dark:bg-green-950 px-3 py-2 text-xs font-medium text-green-700 dark:text-green-400">
                                  Comunicado no prazo.
                                </p>
                              ) : (
                                <p className="mt-2 rounded bg-amber-50 dark:bg-amber-950 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                                  Comunicado {diferenca} {diferenca === 1 ? "dia" : "dias"} fora do prazo.
                                </p>
                              );
                            })()}
                          {distrato.comunicadoVistoria.arquivoUrl && (
                            <ArquivoPreviewBotao
                              url={distrato.comunicadoVistoria.arquivoUrl}
                              nome={distrato.comunicadoVistoria.arquivoNome}
                              tipo={distrato.comunicadoVistoria.arquivoTipo}
                            />
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <ComunicadoVistoriaModal
                            registro={distrato.comunicadoVistoria}
                            hoje={hoje}
                            action={async (formData: FormData) => {
                              "use server";
                              await editarComunicadoVistoria(distrato.id, formData);
                            }}
                          />
                          <ExcluirBotao
                            onExcluir={async () => {
                              "use server";
                              await excluirComunicadoVistoria(distrato.id);
                            }}
                          />
                        </div>
                      </div>
                      <InfoSistema
                        data={distrato.comunicadoVistoria.createdAt}
                        usuario={distrato.comunicadoVistoria.criadoPor?.nome}
                      />
                    </div>
                  )}
                </Divisor>
              )}

              {/* Etapa 4 · Realizar Vistoria */}
              {podeVistoria && (
                <Divisor>
                  <SecaoTitulo
                    titulo="Vistoria de Saída"
                    auditoria={auditoriaPorSecao("VISTORIA_SAIDA")}
                  />
                  {!distrato.vistoriaSaida ? (
                    <VistoriaSaidaModal
                      hoje={hoje}
                      action={async (formData: FormData) => {
                        "use server";
                        await registrarVistoriaSaida(distrato.id, formData);
                      }}
                    />
                  ) : (
                    <div className="text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-slate-700 dark:text-slate-300">
                            Vistoria realizada em {formatData(distrato.vistoriaSaida.data)}
                            {distrato.vistoriaSaida.hora
                              ? ` às ${distrato.vistoriaSaida.hora}`
                              : ""}
                          </p>
                          {distrato.vistoriaSaida.responsavel && (
                            <p className="text-slate-500 dark:text-slate-400">
                              Responsável: {distrato.vistoriaSaida.responsavel}
                            </p>
                          )}
                          <p
                            className={
                              distrato.vistoriaSaida.locadorCompareceu
                                ? "text-green-600 dark:text-green-400"
                                : "text-amber-600 dark:text-amber-400"
                            }
                          >
                            {distrato.vistoriaSaida.locadorCompareceu
                              ? "Locador compareceu"
                              : "Locador não compareceu"}
                          </p>
                          {distrato.vistoriaSaida.observacoes && (
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                              {distrato.vistoriaSaida.observacoes}
                            </p>
                          )}
                          {distrato.vistoriaSaida.arquivoUrl && (
                            <ArquivoPreviewBotao
                              url={distrato.vistoriaSaida.arquivoUrl}
                              nome={distrato.vistoriaSaida.arquivoNome}
                              tipo={distrato.vistoriaSaida.arquivoTipo}
                            />
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <VistoriaSaidaModal
                            registro={distrato.vistoriaSaida}
                            hoje={hoje}
                            action={async (formData: FormData) => {
                              "use server";
                              await editarVistoriaSaida(distrato.id, formData);
                            }}
                          />
                          <ExcluirBotao
                            onExcluir={async () => {
                              "use server";
                              await excluirVistoriaSaida(distrato.id);
                            }}
                          />
                        </div>
                      </div>
                      <InfoSistema
                        data={distrato.vistoriaSaida.createdAt}
                        usuario={distrato.vistoriaSaida.criadoPor?.nome}
                      />
                    </div>
                  )}
                </Divisor>
              )}

              {/* Etapa 5 · Registrar Laudo */}
              {podeLaudo && (
                <Divisor>
                  <SecaoTitulo
                    titulo="Entrega do Laudo"
                    auditoria={auditoriaPorSecao("LAUDO_VISTORIA")}
                  />
                  {!distrato.laudoVistoria ? (
                    <LaudoVistoriaModal
                      hoje={hoje}
                      action={async (formData: FormData) => {
                        "use server";
                        await registrarLaudoVistoria(distrato.id, formData);
                      }}
                    />
                  ) : (
                    <div className="text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-slate-700 dark:text-slate-300">
                            Laudo entregue em {formatData(distrato.laudoVistoria.data)}
                          </p>
                          {distrato.laudoVistoria.arquivoUrl && (
                            <ArquivoPreviewBotao
                              url={distrato.laudoVistoria.arquivoUrl}
                              nome={distrato.laudoVistoria.arquivoNome}
                              tipo={distrato.laudoVistoria.arquivoTipo}
                              label="Ver laudo"
                            />
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <LaudoVistoriaModal
                            registro={distrato.laudoVistoria}
                            hoje={hoje}
                            action={async (formData: FormData) => {
                              "use server";
                              await editarLaudoVistoria(distrato.id, formData);
                            }}
                          />
                          <ExcluirBotao
                            onExcluir={async () => {
                              "use server";
                              await excluirLaudoVistoria(distrato.id);
                            }}
                          />
                        </div>
                      </div>
                      <InfoSistema
                        data={distrato.laudoVistoria.createdAt}
                        usuario={distrato.laudoVistoria.criadoPor?.nome}
                      />
                    </div>
                  )}
                </Divisor>
              )}

              {/* Etapa 6 · Comunicado ao Locador (encerramento) */}
              {podeComunicadoEncerramentoLocador && (
                <Divisor>
                  <SecaoTitulo
                    titulo="Comunicado ao Locador"
                    auditoria={auditoriaPorSecao("COMUNICADO_ENCERRAMENTO_LOCADOR")}
                  />
                  {!distrato.comunicadoEncerramentoLocador ? (
                    <ComunicadoModal
                      hoje={hoje}
                      titulo="Comunicado ao Locador"
                      action={async (formData: FormData) => {
                        "use server";
                        await registrarComunicadoEncerramentoLocador(distrato.id, formData);
                      }}
                    />
                  ) : (
                    <div className="text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-slate-700 dark:text-slate-300">
                            Data: {formatData(distrato.comunicadoEncerramentoLocador.data)} — Forma:{" "}
                            {LABEL_FORMA_AVISO[distrato.comunicadoEncerramentoLocador.forma]}
                          </p>
                          {distrato.comunicadoEncerramentoLocador.arquivoUrl && (
                            <ArquivoPreviewBotao
                              url={distrato.comunicadoEncerramentoLocador.arquivoUrl}
                              nome={distrato.comunicadoEncerramentoLocador.arquivoNome}
                              tipo={distrato.comunicadoEncerramentoLocador.arquivoTipo}
                            />
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <ComunicadoModal
                            registro={distrato.comunicadoEncerramentoLocador}
                            hoje={hoje}
                            titulo="Comunicado ao Locador"
                            action={async (formData: FormData) => {
                              "use server";
                              await editarComunicadoEncerramentoLocador(distrato.id, formData);
                            }}
                          />
                          <ExcluirBotao
                            onExcluir={async () => {
                              "use server";
                              await excluirComunicadoEncerramentoLocador(distrato.id);
                            }}
                          />
                        </div>
                      </div>
                      <InfoSistema
                        data={distrato.comunicadoEncerramentoLocador.createdAt}
                        usuario={distrato.comunicadoEncerramentoLocador.criadoPor?.nome}
                      />
                    </div>
                  )}
                </Divisor>
              )}

              {/* Etapa 7 · Comunicado ao Locatário (encerramento) */}
              {podeComunicadoEncerramentoLocatario && (
                <Divisor>
                  <SecaoTitulo
                    titulo="Comunicado ao Locatário"
                    auditoria={auditoriaPorSecao("COMUNICADO_ENCERRAMENTO_LOCATARIO")}
                  />
                  {!distrato.comunicadoEncerramentoLocatario ? (
                    <ComunicadoModal
                      hoje={hoje}
                      titulo="Comunicado ao Locatário"
                      action={async (formData: FormData) => {
                        "use server";
                        await registrarComunicadoEncerramentoLocatario(distrato.id, formData);
                      }}
                    />
                  ) : (
                    <div className="text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-slate-700 dark:text-slate-300">
                            Data: {formatData(distrato.comunicadoEncerramentoLocatario.data)} — Forma:{" "}
                            {LABEL_FORMA_AVISO[distrato.comunicadoEncerramentoLocatario.forma]}
                          </p>
                          {distrato.comunicadoEncerramentoLocatario.arquivoUrl && (
                            <ArquivoPreviewBotao
                              url={distrato.comunicadoEncerramentoLocatario.arquivoUrl}
                              nome={distrato.comunicadoEncerramentoLocatario.arquivoNome}
                              tipo={distrato.comunicadoEncerramentoLocatario.arquivoTipo}
                            />
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <ComunicadoModal
                            registro={distrato.comunicadoEncerramentoLocatario}
                            hoje={hoje}
                            titulo="Comunicado ao Locatário"
                            action={async (formData: FormData) => {
                              "use server";
                              await editarComunicadoEncerramentoLocatario(distrato.id, formData);
                            }}
                          />
                          <ExcluirBotao
                            onExcluir={async () => {
                              "use server";
                              await excluirComunicadoEncerramentoLocatario(distrato.id);
                            }}
                          />
                        </div>
                      </div>
                      <InfoSistema
                        data={distrato.comunicadoEncerramentoLocatario.createdAt}
                        usuario={distrato.comunicadoEncerramentoLocatario.criadoPor?.nome}
                      />
                    </div>
                  )}
                </Divisor>
              )}

              {concluido && (
                <Divisor>
                  <p className="rounded bg-green-50 dark:bg-green-950 px-3 py-2 text-sm font-medium text-green-700 dark:text-green-400">
                    Entrega de Chaves e Vistoria concluída.
                  </p>
                </Divisor>
              )}
            </>
          )}
        </section>
      )}
    </>
  );

  const conteudoAdequacoes = (
    <section className={SECAO_CLASSE}>
      <SecaoTitulo titulo="Adequações" auditoria={auditoriaPorSecao("ADEQUACOES")} />

      {!distrato.decisaoAdequacao ? (
        <AdequacoesForm
          action={async (formData: FormData) => {
            "use server";
            await registrarDecisaoAdequacao(distrato.id, formData);
          }}
        />
      ) : (
        <div className="text-sm">
          <div className="flex items-start justify-between gap-4">
            <p className="text-slate-700 dark:text-slate-300">
              {distrato.decisaoAdequacao.existemAdequacoes
                ? "Existem adequações a serem realizadas no imóvel."
                : "Não há adequações pendentes para este imóvel."}
            </p>
            <ExcluirBotao
              onExcluir={async () => {
                "use server";
                await excluirDecisaoAdequacao(distrato.id);
              }}
            />
          </div>
          <InfoSistema
            data={distrato.decisaoAdequacao.createdAt}
            usuario={distrato.decisaoAdequacao.criadoPor?.nome}
          />
        </div>
      )}

      {distrato.decisaoAdequacao?.existemAdequacoes && (
        <Divisor>
          {distrato.adequacoes.length > 0 && (
            <ul className="mb-4 flex flex-col gap-2">
              {distrato.adequacoes.map((a) => {
                const aberta = a.status !== "CONCLUIDA";
                const dias = diasEmAberto(a.createdAt);
                const severidade = classificarSeveridade(dias, aberta);
                const corPrazo = {
                  neutro: "text-slate-500 dark:text-slate-400",
                  verde: "text-green-700 dark:text-green-400",
                  amarelo: "text-amber-700 dark:text-amber-400",
                  vermelho: "text-red-700 dark:text-red-400",
                }[severidade];

                return (
                  <li key={a.id}>
                    <Link
                      href={`/manutencoes/${a.id}`}
                      className="block rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm hover:border-slate-300 dark:hover:border-slate-600"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {a.numeroProcesso}
                        </span>
                        {a.emergencial && (
                          <span className="rounded bg-red-100 dark:bg-red-900 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
                            Emergencial
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{a.natureza}</p>
                      <div className="mt-1 flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                          {etapaAdequacao(a)}
                        </span>
                        <span className={`text-xs font-medium ${corPrazo}`}>
                          {aberta
                            ? dias === 0
                              ? "Aberta hoje"
                              : `Em aberto há ${dias} ${dias === 1 ? "dia" : "dias"}`
                            : "Concluída"}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <NovaAdequacaoModal
            action={async (formData: FormData) => {
              "use server";
              await criarAdequacao(distrato.id, formData);
            }}
          />
        </Divisor>
      )}
    </section>
  );

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Distrato — Processo {processo.numeroProcesso}
      </h1>

      {cabecalhoProcesso}

      <AbasDistrato
        abas={[
          { id: "relacionamento", label: "Relacionamento", content: relacionamentoConteudo },
          {
            id: "adequacoes",
            label: "Adequações",
            content: conteudoAdequacoes,
          },
          {
            id: "financeiro",
            label: "Financeiro",
            content: <ConteudoEmBreve titulo="Financeiro" />,
          },
        ]}
      />
    </div>
  );
}
