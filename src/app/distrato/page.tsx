import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatData } from "@/lib/datahora";

export default async function DistratoListaPage() {
  const distratos = await prisma.distrato.findMany({
    include: { processo: true, criadoPor: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Distratos</h1>
        <Link
          href="/distrato/novo"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Novo Distrato
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Processo</th>
              <th className="px-4 py-2">Iniciado em</th>
              <th className="px-4 py-2">Criado por</th>
            </tr>
          </thead>
          <tbody>
            {distratos.map((d) => (
              <tr
                key={d.id}
                className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <td className="px-4 py-2">
                  <Link href={`/distrato/${d.id}`} className="font-medium hover:underline">
                    {d.processo.numeroProcesso}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  {formatData(d.createdAt)}
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  {d.criadoPor.nome}
                </td>
              </tr>
            ))}
            {distratos.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Nenhum distrato cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
