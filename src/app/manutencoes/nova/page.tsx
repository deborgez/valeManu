import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatEndereco } from "@/lib/endereco";
import { criarManutencao } from "../actions";
import CpfInput from "@/components/inputs/CpfInput";
import EnderecoComCep from "@/components/inputs/EnderecoComCep";
import NumeroProcessoInput from "@/components/inputs/NumeroProcessoInput";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export default async function NovaManutencaoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; processoId?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const processoId = params.processoId;

  const processoSelecionado = processoId
    ? await prisma.processo.findUnique({ where: { id: processoId } })
    : null;

  if (!processoSelecionado) {
    const processos = q
      ? await prisma.processo.findMany({
          where: { numeroProcesso: { contains: q, mode: "insensitive" } },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : [];

    const existentes = await prisma.manutencao.groupBy({
      by: ["numeroProcesso"],
      where: { numeroProcesso: { in: processos.map((p) => p.numeroProcesso) } },
      _count: { _all: true },
    });
    const totalPorProcesso = new Map(existentes.map((e) => [e.numeroProcesso, e._count._all]));

    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
          Nova Manutenção — Solicitação
        </h1>

        <div className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Número do Processo
          </label>
          <form className="flex gap-3">
            <NumeroProcessoInput
              name="q"
              defaultValue={q}
              className={CAMPO_CLASSE}
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
              <Link
                key={p.id}
                href={`/manutencoes/nova?processoId=${p.id}`}
                className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-left text-sm hover:border-slate-400 dark:hover:border-slate-500"
              >
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {p.numeroProcesso}
                </p>
                <p className="text-slate-500 dark:text-slate-400">{formatEndereco(p)}</p>
                {(totalPorProcesso.get(p.numeroProcesso) ?? 0) > 0 && (
                  <p className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    Já tem {totalPorProcesso.get(p.numeroProcesso)}{" "}
                    {totalPorProcesso.get(p.numeroProcesso) === 1 ? "manutenção" : "manutenções"}
                  </p>
                )}
              </Link>
            ))}
            {processos.length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Nenhum processo encontrado para &quot;{q}&quot;. O processo precisa estar
                previamente cadastrado.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Nova Manutenção — Solicitação
      </h1>

      <form
        action={criarManutencao}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
      >
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Número do Processo
          </label>
          <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm">
            <span className="text-slate-900 dark:text-slate-100">
              {processoSelecionado.numeroProcesso}
            </span>
            <Link
              href="/manutencoes/nova"
              className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Trocar processo
            </Link>
          </div>
          <input
            type="hidden"
            name="numeroProcesso"
            value={processoSelecionado.numeroProcesso}
          />
        </div>

        <EnderecoComCep defaultValues={processoSelecionado} />

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Solicitante
            </label>
            <select
              name="solicitanteTipo"
              required
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="LOCADOR">Locador</option>
              <option value="LOCATARIO">Locatário</option>
              <option value="IMOBILIARIA">Imobiliária</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome do solicitante (opcional)
            </label>
            <input
              name="solicitanteNome"
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            CPF do solicitante (opcional)
          </label>
          <CpfInput name="solicitanteCpf" className={CAMPO_CLASSE} />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Natureza
          </label>
          <select name="natureza" required className={CAMPO_CLASSE}>
            <option value="Preventiva">Preventiva</option>
            <option value="Corretiva">Corretiva</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Descrição do problema
          </label>
          <textarea
            name="descricaoProblema"
            required
            rows={4}
            className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Competência
            </label>
            <select
              name="competencia"
              required
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="LOCADOR">Locador</option>
              <option value="LOCATARIO">Locatário</option>
              <option value="IMOBILIARIA">Imobiliária</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="emergencial"
              name="emergencial"
              type="checkbox"
              className="h-4 w-4"
            />
            <label htmlFor="emergencial" className="text-sm text-slate-700 dark:text-slate-300">
              É emergencial
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Criar Manutenção
        </button>
      </form>
    </div>
  );
}
