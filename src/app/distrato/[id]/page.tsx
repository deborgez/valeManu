import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatEndereco } from "@/lib/endereco";
import { formatData } from "@/lib/datahora";
import { LABEL_TIPO_FIANCA, LABEL_FORMA_AVISO, LABEL_FORMA_CONTATO } from "@/lib/labels";
import BlobUploadInput from "@/components/inputs/BlobUploadInput";
import AgendamentoVistoriaModal from "@/components/distrato/AgendamentoVistoriaModal";
import EntregaChavesModal from "@/components/distrato/EntregaChavesModal";
import VistoriaSaidaModal from "@/components/distrato/VistoriaSaidaModal";
import {
  registrarAvisoPrevio,
  registrarComunicado,
  registrarContato,
  agendarVistoriaSaida,
  registrarEntregaChaves,
  registrarVistoriaSaida,
  atualizarVistoriaSaida,
} from "../actions";

const SECAO_CLASSE =
  "mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6";
const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

function AlertaForaPrazo({ dias }: { dias: number }) {
  return (
    <p className="mt-2 rounded bg-red-50 dark:bg-red-950 px-3 py-2 text-xs font-medium text-red-700 dark:text-red-400">
      {Math.abs(dias)} {Math.abs(dias) === 1 ? "dia" : "dias"} fora do prazo.
    </p>
  );
}

export default async function DistratoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
    },
  });

  if (!distrato) notFound();

  const { processo } = distrato;
  const locadores = processo.partes.filter((p) => p.tipo === "LOCADOR");
  const locatarios = processo.partes.filter((p) => p.tipo === "LOCATARIO");

  const podeComunicado = Boolean(distrato.avisoPrevio);
  const podeAcompanhamento = Boolean(distrato.comunicadoLocador);

  let alertaContato: string | null = null;
  if (distrato.avisoPrevio) {
    const prazoLimite = new Date(distrato.avisoPrevio.data);
    prazoLimite.setDate(prazoLimite.getDate() + 15);
    const hoje = new Date();
    const temContatoNoPrazo = distrato.contatos.some((c) => c.data <= prazoLimite);
    if (hoje > prazoLimite && !temContatoNoPrazo) {
      alertaContato = "Alerta, nenhum contato registrado dentro do prazo.";
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
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Aviso Prévio do Locatário
        </h2>
        {!distrato.avisoPrevio ? (
          <form
            action={async (formData: FormData) => {
              "use server";
              await registrarAvisoPrevio(distrato.id, formData);
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Data
              </label>
              <input type="date" name="data" required className={CAMPO_CLASSE} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Forma do Aviso
              </label>
              <select name="forma" required className={CAMPO_CLASSE}>
                <option value="EMAIL">E-mail</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="TERMO">Termo</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Arquivo
              </label>
              <BlobUploadInput name="arquivo" accept="image/*,application/pdf" />
            </div>
            <button
              type="submit"
              className="w-fit rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
            >
              Registrar Aviso Prévio
            </button>
          </form>
        ) : (
          <div className="text-sm">
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
            {distrato.avisoPrevio.diasForaPrazo !== null && (
              <AlertaForaPrazo dias={distrato.avisoPrevio.diasForaPrazo} />
            )}
          </div>
        )}
      </section>

      {/* Comunicado ao Locador */}
      {podeComunicado && (
        <section className={SECAO_CLASSE}>
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Comunicado ao Locador
          </h2>
          {!distrato.comunicadoLocador ? (
            <form
              action={async (formData: FormData) => {
                "use server";
                await registrarComunicado(distrato.id, formData);
              }}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Data
                </label>
                <input type="date" name="data" required className={CAMPO_CLASSE} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Forma do Aviso
                </label>
                <select name="forma" required className={CAMPO_CLASSE}>
                  <option value="LIGACAO">Ligação</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Arquivo
                </label>
                <BlobUploadInput name="arquivo" accept="image/*,application/pdf" />
              </div>
              <button
                type="submit"
                className="w-fit rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
              >
                Registrar Comunicado
              </button>
            </form>
          ) : (
            <div className="text-sm">
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
              {distrato.comunicadoLocador.diasForaPrazo !== null && (
                <AlertaForaPrazo dias={distrato.comunicadoLocador.diasForaPrazo} />
              )}
            </div>
          )}
        </section>
      )}

      {/* Acompanhamento do Aviso Prévio */}
      {podeAcompanhamento && (
        <section className={SECAO_CLASSE}>
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Acompanhamento do Aviso Prévio
          </h2>

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
                </li>
              ))}
            </ul>
          )}

          <form
            action={async (formData: FormData) => {
              "use server";
              await registrarContato(distrato.id, formData);
            }}
            className="flex flex-col gap-4"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Data e hora serão registradas automaticamente pelo sistema.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Forma de Comunicação
              </label>
              <select name="forma" required className={CAMPO_CLASSE}>
                <option value="LIGACAO">Ligação</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Arquivo
              </label>
              <BlobUploadInput name="arquivo" accept="image/*,application/pdf" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Previsão de entrega de chaves
                </label>
                <input
                  type="date"
                  name="dataPrevistaEntregaChaves"
                  className={CAMPO_CLASSE}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Previsão de vistoria de saída
                </label>
                <input type="date" name="dataPrevistaVistoriaSaida" className={CAMPO_CLASSE} />
              </div>
            </div>
            <button
              type="submit"
              className="w-fit rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
            >
              Contato Realizado
            </button>
          </form>
        </section>
      )}

      {/* Entrega de Chaves e Vistoria de Saída */}
      <section className={SECAO_CLASSE}>
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Entrega de Chaves e Vistoria de Saída
        </h2>

        <div className="mb-4">
          <AgendamentoVistoriaModal
            action={async (formData: FormData) => {
              "use server";
              await agendarVistoriaSaida(distrato.id, formData);
            }}
          />
          {distrato.agendamentoVistoria && (
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              <p>Vistoria agendada para {formatData(distrato.agendamentoVistoria.data)}</p>
              {distrato.agendamentoVistoria.locadorNaoQuerParticipar && (
                <p className="text-amber-600 dark:text-amber-400">
                  Locador não quer participar
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mb-4">
          <EntregaChavesModal
            action={async (formData: FormData) => {
              "use server";
              await registrarEntregaChaves(distrato.id, formData);
            }}
          />
          {distrato.entregaChaves && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Chaves entregues em {formatData(distrato.entregaChaves.data)}
            </p>
          )}
        </div>

        <div>
          {!distrato.vistoriaSaida ? (
            <VistoriaSaidaModal
              action={async (formData: FormData) => {
                "use server";
                await registrarVistoriaSaida(distrato.id, formData);
              }}
            />
          ) : (
            <div className="rounded border border-slate-100 dark:border-slate-700 p-4">
              <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
                Vistoria realizada em {formatData(distrato.vistoriaSaida.data)}
              </p>
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
                  <BlobUploadInput name="informeArquivo" accept="image/*,application/pdf" />
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
                  <BlobUploadInput name="laudoArquivo" accept="image/*,application/pdf" />
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
