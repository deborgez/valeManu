import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatEndereco } from "@/lib/endereco";
import { formatData, formatSistema, diasEntreDatas } from "@/lib/datahora";
import { LABEL_TIPO_FIANCA, LABEL_FORMA_AVISO, LABEL_FORMA_CONTATO } from "@/lib/labels";
import BlobUploadInput from "@/components/inputs/BlobUploadInput";
import AvisoPrevioModal from "@/components/distrato/AvisoPrevioModal";
import ComunicadoModal from "@/components/distrato/ComunicadoModal";
import AgendamentoVistoriaModal from "@/components/distrato/AgendamentoVistoriaModal";
import ContatoModal from "@/components/distrato/ContatoModal";
import EntregaChavesModal from "@/components/distrato/EntregaChavesModal";
import VistoriaSaidaModal from "@/components/distrato/VistoriaSaidaModal";
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
  agendarVistoriaSaida,
  editarAgendamentoVistoria,
  excluirAgendamentoVistoria,
  registrarEntregaChaves,
  editarEntregaChaves,
  excluirEntregaChaves,
  registrarVistoriaSaida,
  editarVistoriaSaida,
  excluirVistoriaSaida,
  atualizarVistoriaSaida,
} from "../actions";

const SECAO_CLASSE =
  "mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6";
const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

function InfoSistema({ data }: { data: Date }) {
  return (
    <p className="mt-1 text-right text-[10px] italic text-slate-400 dark:text-slate-500">
      {formatSistema(data)}
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
      avisoPrevio: true,
      comunicadoLocador: true,
      contatos: { orderBy: { data: "desc" } },
      agendamentoVistoria: true,
      entregaChaves: true,
      vistoriaSaida: true,
      auditorias: {
        orderBy: { createdAt: "desc" },
        include: { usuario: { select: { nome: true } } },
      },
    },
  });

  if (!distrato) notFound();

  const { processo } = distrato;
  const locadores = processo.partes.filter((p) => p.tipo === "LOCADOR");
  const locatarios = processo.partes.filter((p) => p.tipo === "LOCATARIO");

  const podeComunicado = Boolean(distrato.avisoPrevio);
  const podeAcompanhamento = Boolean(distrato.comunicadoLocador);

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

      {/* Aviso Prévio do Locatário */}
      <section className={SECAO_CLASSE}>
        <SecaoTitulo
          titulo="Aviso Prévio do Locatário"
          auditoria={auditoriaPorSecao("AVISO_PREVIO")}
        />
        {!distrato.avisoPrevio ? (
          <AvisoPrevioModal
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
            <InfoSistema data={distrato.avisoPrevio.createdAt} />
          </div>
        )}
      </section>

      {/* Comunicado ao Locador */}
      {podeComunicado && (
        <section className={SECAO_CLASSE}>
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
              <InfoSistema data={distrato.comunicadoLocador.createdAt} />
            </div>
          )}
        </section>
      )}

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
                  <InfoSistema data={c.data} />
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

      {/* Entrega de Chaves e Vistoria de Saída */}
      <section className={SECAO_CLASSE}>
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Entrega de Chaves e Vistoria de Saída
        </h2>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Agendamento de Vistoria de Saída
            </p>
            <AuditoriaButton entradas={auditoriaPorSecao("AGENDAMENTO_VISTORIA")} />
          </div>
          <AgendamentoVistoriaModal
            action={async (formData: FormData) => {
              "use server";
              await agendarVistoriaSaida(distrato.id, formData);
            }}
          />
          {distrato.agendamentoVistoria && (
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p>Vistoria agendada para {formatData(distrato.agendamentoVistoria.data)}</p>
                  {distrato.agendamentoVistoria.locadorNaoQuerParticipar && (
                    <p className="text-amber-600 dark:text-amber-400">
                      Locador não quer participar
                    </p>
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
              <InfoSistema data={distrato.agendamentoVistoria.createdAt} />
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Entrega das Chaves
            </p>
            <AuditoriaButton entradas={auditoriaPorSecao("ENTREGA_CHAVES")} />
          </div>
          <EntregaChavesModal
            action={async (formData: FormData) => {
              "use server";
              await registrarEntregaChaves(distrato.id, formData);
            }}
          />
          {distrato.entregaChaves && (
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-start justify-between gap-4">
                <p>Chaves entregues em {formatData(distrato.entregaChaves.data)}</p>
                <div className="flex shrink-0 items-center gap-2">
                  <EntregaChavesModal
                    registro={distrato.entregaChaves}
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
              <InfoSistema data={distrato.entregaChaves.createdAt} />
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Vistoria de Saída
            </p>
            <AuditoriaButton entradas={auditoriaPorSecao("VISTORIA_SAIDA")} />
          </div>
          {!distrato.vistoriaSaida ? (
            <VistoriaSaidaModal
              action={async (formData: FormData) => {
                "use server";
                await registrarVistoriaSaida(distrato.id, formData);
              }}
            />
          ) : (
            <div className="rounded border border-slate-100 dark:border-slate-700 p-4">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Vistoria realizada em {formatData(distrato.vistoriaSaida.data)}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <VistoriaSaidaModal
                    registro={distrato.vistoriaSaida}
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
              <div className="mb-3">
                <InfoSistema data={distrato.vistoriaSaida.createdAt} />
              </div>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await atualizarVistoriaSaida(
                    distrato.vistoriaSaida!.id,
                    distrato.id,
                    formData
                  );
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      name="locadorCompareceu"
                      defaultChecked={distrato.vistoriaSaida.locadorCompareceu ?? false}
                      className="h-4 w-4"
                    />
                    Locador compareceu
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      name="locatarioParticipou"
                      defaultChecked={distrato.vistoriaSaida.locatarioParticipou ?? false}
                      className="h-4 w-4"
                    />
                    Locatário participou
                  </label>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Informe ao Locador (caso não tenha comparecido)
                  </p>
                  <div className="mb-2">
                    <input
                      type="date"
                      name="informeData"
                      defaultValue={
                        distrato.vistoriaSaida.informeData
                          ? distrato.vistoriaSaida.informeData.toISOString().slice(0, 10)
                          : ""
                      }
                      className={CAMPO_CLASSE}
                    />
                  </div>
                  <BlobUploadInput
                    name="informeArquivo"
                    accept="image/*,application/pdf"
                    defaultValue={
                      distrato.vistoriaSaida.informeArquivoUrl
                        ? {
                            url: distrato.vistoriaSaida.informeArquivoUrl,
                            nome: distrato.vistoriaSaida.informeArquivoNome ?? "arquivo",
                            tipo: distrato.vistoriaSaida.informeArquivoTipo ?? "",
                          }
                        : undefined
                    }
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Entrega do Laudo
                  </p>
                  <div className="mb-2">
                    <input
                      type="date"
                      name="dataEntregaLaudo"
                      defaultValue={
                        distrato.vistoriaSaida.dataEntregaLaudo
                          ? distrato.vistoriaSaida.dataEntregaLaudo.toISOString().slice(0, 10)
                          : ""
                      }
                      className={CAMPO_CLASSE}
                    />
                  </div>
                  <BlobUploadInput
                    name="laudoArquivo"
                    accept="image/*,application/pdf"
                    defaultValue={
                      distrato.vistoriaSaida.laudoArquivoUrl
                        ? {
                            url: distrato.vistoriaSaida.laudoArquivoUrl,
                            nome: distrato.vistoriaSaida.laudoArquivoNome ?? "arquivo",
                            tipo: distrato.vistoriaSaida.laudoArquivoTipo ?? "",
                          }
                        : undefined
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="w-fit rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
                >
                  Salvar
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
