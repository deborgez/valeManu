import { prisma } from "@/lib/prisma";
import { diasEmAberto } from "@/lib/tempo";
import { formatMoedaExibicao } from "@/lib/masks";
import ListaClicavel from "@/components/ListaClicavel";
import DesempenhoChart from "@/components/DesempenhoChart";
import { LABEL_MANUTENCAO_STATUS, LABEL_PEDIDO_STATUS } from "@/lib/labels";

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

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string }>;
}) {
  const params = await searchParams;
  const de = params.de || primeiroDiaDoMes();
  const ate = params.ate || hoje();

  const dataInicio = new Date(`${de}T00:00:00`);
  const dataFim = new Date(`${ate}T23:59:59`);

  const manutencoes = await prisma.manutencao.findMany({
    where: { createdAt: { gte: dataInicio, lte: dataFim } },
    select: {
      id: true,
      numeroProcesso: true,
      status: true,
      reaberta: true,
      createdAt: true,
      conclusaoServico: { select: { dataConclusao: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const itemDe = (m: (typeof manutencoes)[number]): ItemLista => ({
    id: m.id,
    titulo: `${m.numeroProcesso}`,
    subtitulo: LABEL_MANUTENCAO_STATUS[m.status] ?? m.status,
    href: `/manutencoes/${m.id}`,
  });

  const itensTotal = manutencoes.map(itemDe);
  const itensReabertas = manutencoes.filter((m) => m.reaberta).map(itemDe);

  const manutencoesAtrasadas = manutencoes.filter((m) => {
    if (m.conclusaoServico) {
      const dias = Math.floor(
        (m.conclusaoServico.dataConclusao.getTime() - m.createdAt.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return dias >= 3;
    }
    if (m.status === "CONCLUIDA") return false;
    return diasEmAberto(m.createdAt) >= 3;
  });
  const itensAtrasadas = manutencoesAtrasadas.map(itemDe);

  const pedidos = await prisma.pedidoOrcamento.findMany({
    where: { createdAt: { gte: dataInicio, lte: dataFim } },
    select: {
      id: true,
      status: true,
      valorMaoDeObra: true,
      valorMaterial: true,
      prestador: { select: { id: true, nome: true } },
      manutencao: { select: { id: true, numeroProcesso: true } },
    },
  });

  const porPrestador = new Map<
    string,
    {
      nome: string;
      solicitacoes: number;
      aprovados: number;
      valorAprovado: number;
      itensSolicitacoes: ItemLista[];
    }
  >();

  for (const pedido of pedidos) {
    const atual = porPrestador.get(pedido.prestador.id) ?? {
      nome: pedido.prestador.nome,
      solicitacoes: 0,
      aprovados: 0,
      valorAprovado: 0,
      itensSolicitacoes: [],
    };
    atual.solicitacoes += 1;
    atual.itensSolicitacoes.push({
      id: pedido.id,
      titulo: `${pedido.manutencao.numeroProcesso}`,
      subtitulo: LABEL_PEDIDO_STATUS[pedido.status] ?? pedido.status,
      href: `/manutencoes/${pedido.manutencao.id}`,
    });
    if (pedido.status === "APROVADO") {
      atual.aprovados += 1;
      atual.valorAprovado += (pedido.valorMaoDeObra ?? 0) + (pedido.valorMaterial ?? 0);
    }
    porPrestador.set(pedido.prestador.id, atual);
  }

  const prestadoresOrdenados = [...porPrestador.values()].sort(
    (a, b) => b.solicitacoes - a.solicitacoes
  );

  const valorTotalPago = prestadoresOrdenados.reduce(
    (soma, p) => soma + p.valorAprovado,
    0
  );

  // Monta os dados do gráfico agrupando por dia (ou por blocos de dias, se o período for longo).
  const totalDias = Math.max(
    1,
    Math.ceil((dataFim.getTime() - dataInicio.getTime()) / 86400000) + 1
  );
  const diasPorBloco = Math.max(1, Math.ceil(totalDias / 30));

  const blocos: { label: string; valor: number; inicio: number }[] = [];
  for (
    let cursor = new Date(dataInicio);
    cursor <= dataFim;
    cursor.setDate(cursor.getDate() + diasPorBloco)
  ) {
    const inicioBloco = new Date(cursor);
    const label = inicioBloco.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    blocos.push({ label, valor: 0, inicio: inicioBloco.getTime() });
  }

  for (const m of manutencoes) {
    const idx = Math.min(
      blocos.length - 1,
      Math.floor((m.createdAt.getTime() - dataInicio.getTime()) / 86400000 / diasPorBloco)
    );
    if (blocos[idx]) blocos[idx].valor += 1;
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Relatório de Desempenho
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

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ListaClicavel
          titulo="Manutenções no período"
          itens={itensTotal}
          trigger={
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center hover:border-slate-400 dark:hover:border-slate-500">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {manutencoes.length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manutenções no período
              </p>
            </div>
          }
        />
        <ListaClicavel
          titulo="Passaram do prazo"
          itens={itensAtrasadas}
          trigger={
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-center hover:border-red-400 dark:hover:border-red-600">
              <p className="text-2xl font-semibold text-red-800 dark:text-red-400">
                {manutencoesAtrasadas.length}
              </p>
              <p className="text-xs text-red-700 dark:text-red-400">
                Passaram do prazo (3+ dias)
              </p>
            </div>
          }
        />
        <ListaClicavel
          titulo="Reabertas"
          itens={itensReabertas}
          trigger={
            <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 p-4 text-center hover:border-orange-400 dark:hover:border-orange-600">
              <p className="text-2xl font-semibold text-orange-800 dark:text-orange-400">
                {itensReabertas.length}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-400">
                Reabertas
              </p>
            </div>
          }
        />
        <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-4 text-center">
          <p className="text-2xl font-semibold text-green-800 dark:text-green-400">
            R$ {formatMoedaExibicao(valorTotalPago)}
          </p>
          <p className="text-xs text-green-700 dark:text-green-400">
            Valor aprovado a prestadores
          </p>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Manutenções abertas no período
      </h2>
      <div className="mb-6">
        <DesempenhoChart dados={blocos} />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Desempenho por prestador
      </h2>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Prestador</th>
              <th className="px-4 py-2">Solicitações</th>
              <th className="px-4 py-2">Orçamentos aprovados</th>
              <th className="px-4 py-2">Valor aprovado</th>
            </tr>
          </thead>
          <tbody>
            {prestadoresOrdenados.map((p) => (
              <tr key={p.nome} className="border-t border-slate-100 dark:border-slate-700">
                <td className="px-4 py-2">{p.nome}</td>
                <td className="px-4 py-2">
                  <ListaClicavel
                    titulo={`Solicitações — ${p.nome}`}
                    itens={p.itensSolicitacoes}
                    trigger={
                      <span className="underline decoration-dotted hover:text-slate-900 dark:hover:text-slate-100">
                        {p.solicitacoes}
                      </span>
                    }
                  />
                </td>
                <td className="px-4 py-2">{p.aprovados}</td>
                <td className="px-4 py-2">R$ {formatMoedaExibicao(p.valorAprovado)}</td>
              </tr>
            ))}
            {prestadoresOrdenados.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Nenhuma solicitação de orçamento no período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
