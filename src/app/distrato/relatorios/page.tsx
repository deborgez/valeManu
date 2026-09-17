import { prisma } from "@/lib/prisma";
import { diasEntreDatas } from "@/lib/datahora";
import ListaClicavel from "@/components/ListaClicavel";
import { calcularMetricasDistrato, formatDias } from "@/lib/desempenhoDistrato";

function primeiroDiaDoMes(): string {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

const CAMPO_CLASSE =
  "rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

type ItemLista = { id: string; titulo: string; subtitulo: string; href: string };

export default async function RelatoriosDistratoPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string }>;
}) {
  const params = await searchParams;
  const de = params.de || primeiroDiaDoMes();
  const ate = params.ate || hoje();

  const dataInicio = new Date(`${de}T00:00:00`);
  const dataFim = new Date(`${ate}T23:59:59`);

  const distratos = await prisma.distrato.findMany({
    where: { createdAt: { gte: dataInicio, lte: dataFim } },
    include: {
      processo: { select: { numeroProcesso: true } },
      avisoPrevio: { select: { data: true } },
      comunicadoLocador: { select: { data: true } },
      contatos: { select: { data: true } },
      entregaChaves: { select: { data: true } },
      vistoriaSaida: { select: { data: true } },
      comunicadoVistoria: { select: { data: true } },
      laudoVistoria: { select: { data: true } },
      comunicadoEncerramentoLocador: { select: { data: true } },
      comunicadoEncerramentoLocatario: { select: { data: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const metricas = calcularMetricasDistrato(distratos);

  const itemDe = (d: (typeof distratos)[number]): ItemLista => ({
    id: d.id,
    titulo: d.processo.numeroProcesso,
    subtitulo: "",
    href: `/distrato/${d.id}`,
  });

  const itensNoPrazo = (
    filtro: (d: (typeof distratos)[number]) => boolean
  ): ItemLista[] => distratos.filter(filtro).map(itemDe);

  const itensComunicadoLocadorForaPrazo = itensNoPrazo(
    (d) =>
      Boolean(d.avisoPrevio) &&
      Boolean(d.comunicadoLocador) &&
      diasEntreDatas(d.comunicadoLocador!.data, d.avisoPrevio!.data) !== 0
  );
  const itensComunicadoLocadorSemRegistro = itensNoPrazo(
    (d) => Boolean(d.avisoPrevio) && !d.comunicadoLocador
  );

  const primeiroContato = (d: (typeof distratos)[number]) =>
    d.contatos.length === 0
      ? null
      : d.contatos.reduce((min, c) => (c.data < min.data ? c : min)).data;

  const itensContatoForaPrazo = itensNoPrazo((d) => {
    if (!d.avisoPrevio) return false;
    const contato = primeiroContato(d);
    if (!contato) return false;
    const prazoLimite = new Date(d.avisoPrevio.data);
    prazoLimite.setDate(prazoLimite.getDate() + 15);
    return contato > prazoLimite;
  });
  const itensContatoSemRegistro = itensNoPrazo(
    (d) => Boolean(d.avisoPrevio) && d.contatos.length === 0
  );

  const itensEntregaChavesForaPrazo = itensNoPrazo((d) => {
    if (!d.avisoPrevio || !d.entregaChaves) return false;
    const prazoLimite = new Date(d.avisoPrevio.data);
    prazoLimite.setDate(prazoLimite.getDate() + 30);
    return d.entregaChaves.data > prazoLimite;
  });
  const itensEntregaChavesSemRegistro = itensNoPrazo(
    (d) => Boolean(d.avisoPrevio) && !d.entregaChaves
  );

  const itensComunicadoVistoriaForaPrazo = itensNoPrazo(
    (d) =>
      Boolean(d.entregaChaves) &&
      Boolean(d.comunicadoVistoria?.data) &&
      diasEntreDatas(d.comunicadoVistoria!.data!, d.entregaChaves!.data) !== 0
  );
  const itensComunicadoVistoriaSemRegistro = itensNoPrazo(
    (d) => Boolean(d.entregaChaves) && !d.comunicadoVistoria?.data
  );

  const itensConcluidos = distratos
    .filter((d) => d.comunicadoEncerramentoLocatario)
    .map(itemDe);
  const itensEmAndamento = distratos
    .filter((d) => !d.comunicadoEncerramentoLocatario)
    .map(itemDe);

  const CARTAO_PRAZO = (
    label: string,
    contagem: { noPrazo: number; foraPrazo: number; semRegistro: number },
    itensForaPrazo: ItemLista[],
    itensSemRegistro: ItemLista[]
  ) => (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <p className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-semibold text-green-700 dark:text-green-400">
            {contagem.noPrazo}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">No prazo</p>
        </div>
        <ListaClicavel
          titulo={`${label} — Fora do prazo`}
          itens={itensForaPrazo}
          trigger={
            <div>
              <p className="text-lg font-semibold text-red-700 dark:text-red-400">
                {contagem.foraPrazo}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Fora do prazo</p>
            </div>
          }
        />
        <ListaClicavel
          titulo={`${label} — Sem registro`}
          itens={itensSemRegistro}
          trigger={
            <div>
              <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">
                {contagem.semRegistro}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sem registro</p>
            </div>
          }
        />
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Relatório de Distratos
      </h1>

      <form className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            De
          </label>
          <input type="date" name="de" defaultValue={de} className={CAMPO_CLASSE} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Até
          </label>
          <input type="date" name="ate" defaultValue={ate} className={CAMPO_CLASSE} />
        </div>
        <button
          type="submit"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Filtrar
        </button>
      </form>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <ListaClicavel
          titulo="Distratos no período"
          itens={distratos.map(itemDe)}
          trigger={
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center hover:border-slate-400 dark:hover:border-slate-500">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {metricas.totalDistratos}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Iniciados no período</p>
            </div>
          }
        />
        <ListaClicavel
          titulo="Concluídos"
          itens={itensConcluidos}
          trigger={
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-4 text-center hover:border-green-400 dark:hover:border-green-600">
              <p className="text-2xl font-semibold text-green-800 dark:text-green-400">
                {metricas.concluidos}
              </p>
              <p className="text-xs text-green-700 dark:text-green-400">Concluídos</p>
            </div>
          }
        />
        <ListaClicavel
          titulo="Em andamento"
          itens={itensEmAndamento}
          trigger={
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4 text-center hover:border-amber-400 dark:hover:border-amber-600">
              <p className="text-2xl font-semibold text-amber-800 dark:text-amber-400">
                {metricas.emAndamento}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">Em andamento</p>
            </div>
          }
        />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Prazos legais (aviso prévio e comunicados)
      </h2>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARTAO_PRAZO(
          "Comunicado ao Locador (mesmo dia do Aviso Prévio)",
          metricas.prazoComunicadoLocador,
          itensComunicadoLocadorForaPrazo,
          itensComunicadoLocadorSemRegistro
        )}
        {CARTAO_PRAZO(
          "Acompanhamento (até 15 dias do Aviso Prévio)",
          metricas.prazoContato,
          itensContatoForaPrazo,
          itensContatoSemRegistro
        )}
        {CARTAO_PRAZO(
          "Entrega de Chaves (até 30 dias do Aviso Prévio)",
          metricas.prazoEntregaChaves,
          itensEntregaChavesForaPrazo,
          itensEntregaChavesSemRegistro
        )}
        {CARTAO_PRAZO(
          "Comunicado da Vistoria (mesmo dia da Entrega de Chaves)",
          metricas.prazoComunicadoVistoria,
          itensComunicadoVistoriaForaPrazo,
          itensComunicadoVistoriaSemRegistro
        )}
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Tempo médio por etapa (onde está o gargalo)
      </h2>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Aviso Prévio até 1º contato",
            valor: metricas.mediaDiasAteContato,
            etapa: "Aviso Prévio até primeiro contato",
          },
          {
            label: "Aviso Prévio até Entrega de Chaves",
            valor: metricas.mediaDiasAteEntregaChaves,
            etapa: "Aviso Prévio até Entrega de Chaves",
          },
          {
            label: "Entrega de Chaves até Vistoria",
            valor: metricas.mediaDiasEntregaAteVistoria,
            etapa: "Entrega de Chaves até Vistoria de Saída",
          },
          {
            label: "Vistoria até Laudo",
            valor: metricas.mediaDiasVistoriaAteLaudo,
            etapa: "Vistoria de Saída até Laudo",
          },
          {
            label: "Laudo até Comunicado de Encerramento",
            valor: metricas.mediaDiasLaudoAteComunicadoEncerramento,
            etapa: "Laudo até Comunicado de Encerramento ao Locador",
          },
          {
            label: "Comunicado até Encerramento ao Locatário",
            valor: metricas.mediaDiasComunicadoAteEncerramento,
            etapa: "Comunicado ao Locador até Encerramento ao Locatário",
          },
        ].map((item) => {
          const ehGargalo = metricas.gargalo?.etapa === item.etapa;
          return (
            <div
              key={item.label}
              className={`rounded-lg border p-4 text-center ${
                ehGargalo
                  ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              }`}
            >
              <p
                className={`text-xl font-semibold ${
                  ehGargalo
                    ? "text-red-800 dark:text-red-400"
                    : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {formatDias(item.valor)}
              </p>
              <p
                className={`text-xs ${
                  ehGargalo
                    ? "text-red-700 dark:text-red-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {item.label}
                {ehGargalo && " — maior gargalo"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center">
        <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {formatDias(metricas.mediaDiasTotal)}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Duração média total (Aviso Prévio até Encerramento, {metricas.concluidos} concluídos)
        </p>
      </div>
    </div>
  );
}
