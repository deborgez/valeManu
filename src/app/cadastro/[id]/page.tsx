import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatEndereco } from "@/lib/endereco";
import { LABEL_TIPO_FIANCA } from "@/lib/labels";
import { formatData } from "@/lib/datahora";

export default async function ProcessoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const processo = await prisma.processo.findUnique({
    where: { id },
    include: { criadoPor: true },
  });

  if (!processo) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Processo {processo.numeroProcesso}
      </h1>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <div className="mb-4">
          <p className="mb-1 text-sm text-slate-400 dark:text-slate-500">Endereço do imóvel</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {formatEndereco(processo)}
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="mb-1 text-slate-400 dark:text-slate-500">Locador</p>
            <p className="text-slate-700 dark:text-slate-300">{processo.locadorNome}</p>
            <p className="text-slate-500 dark:text-slate-400">{processo.locadorTelefone}</p>
          </div>
          <div>
            <p className="mb-1 text-slate-400 dark:text-slate-500">Locatário</p>
            <p className="text-slate-700 dark:text-slate-300">{processo.locatarioNome}</p>
            <p className="text-slate-500 dark:text-slate-400">{processo.locatarioTelefone}</p>
          </div>
        </div>

        <div className="mb-4 text-sm">
          <p className="mb-1 text-slate-400 dark:text-slate-500">
            {LABEL_TIPO_FIANCA[processo.tipoFianca]}
          </p>
          <p className="text-slate-700 dark:text-slate-300">{processo.fiancaNome}</p>
          {processo.fiancaTelefone && (
            <p className="text-slate-500 dark:text-slate-400">{processo.fiancaTelefone}</p>
          )}
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          Cadastrado por {processo.criadoPor.nome} em{" "}
          {formatData(processo.createdAt)}
        </p>
      </div>
    </div>
  );
}
