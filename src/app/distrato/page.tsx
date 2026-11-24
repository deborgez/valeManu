import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatData } from "@/lib/datahora";
import TabelaLista, { type LinhaLista } from "@/components/TabelaLista";

export default async function DistratoListaPage() {
  const distratos = await prisma.distrato.findMany({
    include: { processo: true, criadoPor: true },
    orderBy: { createdAt: "desc" },
  });

  const linhas: LinhaLista[] = distratos.map((d) => ({
    id: d.id,
    busca: [d.processo.numeroProcesso, formatData(d.createdAt), d.criadoPor.nome].join(" "),
    ordenar: {
      processo: d.processo.numeroProcesso,
      iniciado: d.createdAt.getTime(),
      criadoPor: d.criadoPor.nome,
    },
    linha: (
      <tr
        key={d.id}
        className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
      >
        <td className="px-4 py-2">
          <Link href={`/distrato/${d.id}`} className="font-medium hover:underline">
            {d.processo.numeroProcesso}
          </Link>
        </td>
        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{formatData(d.createdAt)}</td>
        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{d.criadoPor.nome}</td>
      </tr>
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Distratos</h1>
        <Link
          href="/distrato/novo"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Novo Distrato
        </Link>
      </div>

      <TabelaLista
        colunas={[
          { chave: "processo", rotulo: "Processo", ordenavel: true },
          { chave: "iniciado", rotulo: "Iniciado em", ordenavel: true },
          { chave: "criadoPor", rotulo: "Criado por", ordenavel: true },
        ]}
        linhas={linhas}
        vazio="Nenhum distrato cadastrado ainda."
        ordemInicial={{ chave: "iniciado", direcao: "desc" }}
        placeholderBusca="Buscar por processo, data ou criador"
      />
    </div>
  );
}
