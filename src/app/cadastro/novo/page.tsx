import { prisma } from "@/lib/prisma";
import { criarProcesso } from "../actions";
import ProcessoForm from "@/components/inputs/ProcessoForm";

export default async function NovoProcessoPage() {
  const imobiliaria = await prisma.imobiliaria.findUnique({
    where: { id: "singleton" },
    select: { nome: true },
  });

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Novo Processo — Cadastro
      </h1>

      <ProcessoForm action={criarProcesso} unidadePadrao={imobiliaria?.nome ?? ""} />
    </div>
  );
}
