import { prisma } from "@/lib/prisma";
import { formatMoedaExibicao } from "@/lib/masks";
import { formatData } from "@/lib/datahora";

const ROTULO_TIPO: Record<string, string> = {
  ALUGUEL: "Aluguéis",
  AGUA: "Água",
  ENERGIA: "Energia",
  IPTU: "IPTU",
  CONDOMINIO: "Condomínio",
  SEGURO: "Seguros",
};

function mesLabel(mes: string): string {
  const [ano, m] = mes.split("-");
  return `${m}/${ano}`;
}

export default async function FinanceiroPage() {
  const [lancamentos, parcelas] = await Promise.all([
    prisma.lancamentoFinanceiro.findMany({
      select: { tipo: true, mesCompetencia: true, valor: true },
    }),
    prisma.parcelaAcordo.findMany({
      select: { valor: true, pago: true, dataVencimento: true },
    }),
  ]);

  const totalPorTipo = new Map<string, number>();
  const totalPorMes = new Map<string, number>();
  for (const l of lancamentos) {
    totalPorTipo.set(l.tipo, (totalPorTipo.get(l.tipo) ?? 0) + l.valor);
    totalPorMes.set(l.mesCompetencia, (totalPorMes.get(l.mesCompetencia) ?? 0) + l.valor);
  }
  const totalGeral = lancamentos.reduce((s, l) => s + l.valor, 0);
  const meses = Array.from(totalPorMes.entries()).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12);
  const maiorMes = Math.max(1, ...meses.map(([, v]) => v));

  const hoje = new Date();
  const recebidas = parcelas.filter((p) => p.pago).reduce((s, p) => s + p.valor, 0);
  const aVencer = parcelas.filter((p) => !p.pago && p.dataVencimento >= hoje);
  const vencidas = parcelas.filter((p) => !p.pago && p.dataVencimento < hoje);
  const soma = (l: { valor: number }[]) => l.reduce((s, p) => s + p.valor, 0);

  const cartoes = [
    { titulo: "Valores em aberto", valor: totalGeral, detalhe: `${lancamentos.length} lançamentos` },
    { titulo: "Acordos recebidos", valor: recebidas, detalhe: "parcelas pagas" },
    { titulo: "Parcelas a vencer", valor: soma(aVencer), detalhe: `${aVencer.length} parcelas` },
    { titulo: "Parcelas vencidas", valor: soma(vencidas), detalhe: `${vencidas.length} parcelas` },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Painel financeiro
      </h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Visão geral dos valores lançados nos distratos e dos acordos de pagamento. Atualizado em{" "}
        {formatData(hoje)}.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cartoes.map((c) => (
          <div
            key={c.titulo}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <p className="text-xs text-slate-400 dark:text-slate-500">{c.titulo}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              R$ {formatMoedaExibicao(c.valor)}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{c.detalhe}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Em aberto por tipo
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            {Object.keys(ROTULO_TIPO).map((tipo) => (
              <li key={tipo} className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">{ROTULO_TIPO[tipo]}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  R$ {formatMoedaExibicao(totalPorTipo.get(tipo) ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Por mês de competência
          </h2>
          {meses.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum lançamento ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {meses.map(([mes, valor]) => (
                <li key={mes} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-slate-500 dark:text-slate-400">
                    {mesLabel(mes)}
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${Math.max(3, (valor / maiorMes) * 100)}%` }}
                    />
                  </div>
                  <span className="w-28 shrink-0 text-right font-medium text-slate-900 dark:text-slate-100">
                    R$ {formatMoedaExibicao(valor)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
