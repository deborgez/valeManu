import { prisma } from "@/lib/prisma";
import { formatEndereco } from "@/lib/endereco";
import { LABEL_TIPO_FIANCA } from "@/lib/labels";
import Link from "next/link";

export default async function CadastroPage() {
  const processos = await prisma.processo.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Cadastro de Processos
        </h1>
        <Link
          href="/cadastro/novo"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Novo Processo
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Processo</th>
              <th className="px-4 py-2">Endereço</th>
              <th className="px-4 py-2">Locador</th>
              <th className="px-4 py-2">Locatário</th>
              <th className="px-4 py-2">Fiança</th>
            </tr>
          </thead>
          <tbody>
            {processos.map((p) => (
              <tr
                key={p.id}
                className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <td className="px-4 py-2">
                  <Link href={`/cadastro/${p.id}`} className="font-medium hover:underline">
                    {p.numeroProcesso}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  {formatEndereco(p)}
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  {p.locadorNome}
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  {p.locatarioNome}
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  {LABEL_TIPO_FIANCA[p.tipoFianca]}
                </td>
              </tr>
            ))}
            {processos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Nenhum processo cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
