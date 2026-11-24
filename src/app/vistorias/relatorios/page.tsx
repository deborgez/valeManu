import { prisma } from "@/lib/prisma";
import { LABEL_TIPO_VISTORIA, diasUteisAteEntrega, entregueNoPrazo } from "@/lib/vistorias";

function formatarDias(n: number | null): string {
  if (n === null) return "—";
  const valor = Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
  return `${valor} ${n === 1 ? "dia útil" : "dias úteis"}`;
}

function Quadro({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: string }) {
  return (
    <div className="rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3">
      <p className="text-xs text-slate-400 dark:text-slate-500">{rotulo}</p>
      <p className={`text-lg font-semibold ${destaque ?? "text-slate-900 dark:text-slate-100"}`}>
        {valor}
      </p>
    </div>
  );
}

export default async function RelatorioVistoriasPage() {
  const vistorias = await prisma.vistoria.findMany({
    select: { tipo: true, status: true, createdAt: true, agendadaPara: true, entregueData: true },
  });

  const tipos = ["ENTRADA", "SAIDA"] as const;

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Relatório de Vistorias
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {tipos.map((tipo) => {
          const doTipo = vistorias.filter((v) => v.tipo === tipo);
          const entregues = doTipo.filter((v) => v.status === "ENTREGUE");
          const noPrazo = entregues.filter((v) => entregueNoPrazo(v) === true).length;
          const foraPrazo = entregues.length - noPrazo;
          const duracoes = entregues
            .map((v) => diasUteisAteEntrega(v))
            .filter((d): d is number => d !== null);
          const minimo = duracoes.length ? Math.min(...duracoes) : null;
          const maximo = duracoes.length ? Math.max(...duracoes) : null;
          const media = duracoes.length
            ? duracoes.reduce((soma, d) => soma + d, 0) / duracoes.length
            : null;
          const percentualNoPrazo = entregues.length
            ? Math.round((noPrazo / entregues.length) * 100)
            : null;

          return (
            <section
              key={tipo}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
            >
              <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Vistorias de {LABEL_TIPO_VISTORIA[tipo]}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Quadro rotulo="Solicitadas" valor={String(doTipo.length)} />
                <Quadro rotulo="Pendentes" valor={String(doTipo.length - entregues.length)} />
                <Quadro rotulo="Entregues" valor={String(entregues.length)} />
                <Quadro
                  rotulo="Entregues no prazo"
                  valor={
                    percentualNoPrazo === null
                      ? "—"
                      : `${noPrazo} (${percentualNoPrazo}%)`
                  }
                  destaque="text-green-700 dark:text-green-400"
                />
                <Quadro
                  rotulo="Entregues fora do prazo"
                  valor={String(foraPrazo)}
                  destaque={foraPrazo > 0 ? "text-red-700 dark:text-red-400" : undefined}
                />
                <Quadro rotulo="Prazo mínimo de entrega" valor={formatarDias(minimo)} />
                <Quadro rotulo="Prazo máximo de entrega" valor={formatarDias(maximo)} />
                <Quadro rotulo="Média de entrega" valor={formatarDias(media)} />
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
        Prazo de entrega: 5 dias úteis a partir da data de solicitação. Os tempos de entrega são
        contados em dias úteis (sem fins de semana e feriados nacionais).
      </p>
    </div>
  );
}
