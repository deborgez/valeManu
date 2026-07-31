import { prisma } from "@/lib/prisma";
import { formatEndereco } from "@/lib/endereco";
import { criarDistrato } from "../actions";
import NumeroProcessoInput from "@/components/inputs/NumeroProcessoInput";

export default async function NovoDistratoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";

  const processos = q
    ? await prisma.processo.findMany({
        where: { numeroProcesso: { contains: q, mode: "insensitive" } },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Novo Distrato
      </h1>

      <div className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form className="flex gap-3">
          <NumeroProcessoInput
            name="q"
            defaultValue={q}
            className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
          >
            Buscar
          </button>
        </form>
      </div>

      {q && (
        <div className="flex flex-col gap-2">
          {processos.map((p) => (
            <form
              key={p.id}
              action={async () => {
                "use server";
                await criarDistrato(p.id);
              }}
            >
              <button
                type="submit"
                className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-left text-sm hover:border-slate-400 dark:hover:border-slate-500"
              >
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {p.numeroProcesso}
                </p>
                <p className="text-slate-500 dark:text-slate-400">{formatEndereco(p)}</p>
              </button>
            </form>
          ))}
          {processos.length === 0 && (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Nenhum processo encontrado para &quot;{q}&quot;.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
