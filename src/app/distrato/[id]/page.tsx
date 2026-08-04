import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatEndereco } from "@/lib/endereco";
import { formatData, formatSistema, diasEntreDatas, hojeSaoPaulo } from "@/lib/datahora";
import { LABEL_TIPO_FIANCA, LABEL_FORMA_AVISO, LABEL_FORMA_CONTATO } from "@/lib/labels";
import AvisoPrevioModal from "@/components/distrato/AvisoPrevioModal";
import ComunicadoModal from "@/components/distrato/ComunicadoModal";
import ContatoModal from "@/components/distrato/ContatoModal";
import LocalEntregaChavesForm from "@/components/distrato/LocalEntregaChavesForm";
import EntregaChavesModal from "@/components/distrato/EntregaChavesModal";
import AgendamentoVistoriaModal from "@/components/distrato/AgendamentoVistoriaModal";
import ComunicadoVistoriaModal from "@/components/distrato/ComunicadoVistoriaModal";
import VistoriaSaidaModal from "@/components/distrato/VistoriaSaidaModal";
import FotosVistoriaModal from "@/components/distrato/FotosVistoriaModal";
import LaudoVistoriaModal from "@/components/distrato/LaudoVistoriaModal";
import ExcluirBotao from "@/components/distrato/ExcluirBotao";
import AuditoriaButton from "@/components/distrato/AuditoriaButton";
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
  registrarFotosVistoria,
  editarFotosVistoria,
  excluirFotosVistoria,
  registrarLaudoVistoria,
  editarLaudoVistoria,
  excluirLaudoVistoria,
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

export default async function DistratoDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erroComunicado?: string }>;
}) {
  const { id } = await params;
  const { erroComunicado } = await searchParams;

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
      fotosVistoria: { include: { criadoPor: { select: { nome: true } } } },
      laudoVistoria: { include: { criadoPor: { select: { nome: true } } } },
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
  const podeFotos = Boolean(distrato.vistoriaSaida);
  const podeLaudo = Boolean(distrato.fotosVistoria);
  const concluido = Boolean(distrato.laudoVistoria);

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

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Distrato — Processo {processo.numeroProcesso}
      </h1>

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
                  <a
                    href={distrato.avisoPrevio.arquivoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-500 dark:text-slate-400 underline"
                  >
                    Ver arquivo
                  </a>
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
                      <a
                        href={distrato.comunicadoLocador.arquivoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-500 dark:text-slate-400 underline"
                      >
                        Ver arquivo
                      </a>
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
                        <a
                          href={c.arquivoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-500 dark:text-slate-400 underline"
                        >
                          Ver arquivo
                        </a>
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
                            <a
                              href={distrato.entregaChaves.termoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-slate-500 dark:text-slate-400 underline"
                            >
                              Ver termo
                            </a>
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
                    titulo="Agendar Vistoria"
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
                            <a
                              href={distrato.agendamentoVistoria.arquivoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-slate-500 dark:text-slate-400 underline"
                            >
                              Ver arquivo
                            </a>
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

              {/* Etapa 3 · Comunicar Locador (ambos os ramos) */}
              {podeComunicadoVistoria && (
                <Divisor>
                  <SecaoTitulo
                    titulo="Comunicar Locador"
                    auditoria={auditoriaPorSecao("COMUNICADO_VISTORIA")}
                  />
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
                          {distrato.comunicadoVistoria.arquivoUrl && (
                            <a
                              href={distrato.comunicadoVistoria.arquivoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-slate-500 dark:text-slate-400 underline"
                            >
                              Ver arquivo
                            </a>
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
                    titulo="Realizar Vistoria"
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
                          {distrato.vistoriaSaida.locadorCompareceu && (
                            <p className="text-green-600 dark:text-green-400">
                              Locador compareceu
                            </p>
                          )}
                          {distrato.vistoriaSaida.observacoes && (
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                              {distrato.vistoriaSaida.observacoes}
                            </p>
                          )}
                          {distrato.vistoriaSaida.arquivoUrl && (
                            <a
                              href={distrato.vistoriaSaida.arquivoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-slate-500 dark:text-slate-400 underline"
                            >
                              Ver arquivo
                            </a>
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

              {/* Etapa 5 · Registrar Fotos */}
              {podeFotos && (
                <Divisor>
                  <SecaoTitulo
                    titulo="Registrar Fotos da Vistoria"
                    auditoria={auditoriaPorSecao("FOTOS_VISTORIA")}
                  />
                  {!distrato.fotosVistoria ? (
                    <FotosVistoriaModal
                      hoje={hoje}
                      action={async (formData: FormData) => {
                        "use server";
                        await registrarFotosVistoria(distrato.id, formData);
                      }}
                    />
                  ) : (
                    <div className="text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-slate-700 dark:text-slate-300">
                          Fotos tiradas em {formatData(distrato.fotosVistoria.data)}
                        </p>
                        <div className="flex shrink-0 items-center gap-2">
                          <FotosVistoriaModal
                            registro={distrato.fotosVistoria}
                            hoje={hoje}
                            action={async (formData: FormData) => {
                              "use server";
                              await editarFotosVistoria(distrato.id, formData);
                            }}
                          />
                          <ExcluirBotao
                            onExcluir={async () => {
                              "use server";
                              await excluirFotosVistoria(distrato.id);
                            }}
                          />
                        </div>
                      </div>
                      <InfoSistema
                        data={distrato.fotosVistoria.createdAt}
                        usuario={distrato.fotosVistoria.criadoPor?.nome}
                      />
                    </div>
                  )}
                </Divisor>
              )}

              {/* Etapa 6 · Registrar Laudo */}
              {podeLaudo && (
                <Divisor>
                  <SecaoTitulo
                    titulo="Registrar Entrega do Laudo"
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
                            <a
                              href={distrato.laudoVistoria.arquivoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-slate-500 dark:text-slate-400 underline"
                            >
                              Ver laudo
                            </a>
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
    </div>
  );
}
