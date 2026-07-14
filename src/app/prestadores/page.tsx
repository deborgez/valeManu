import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { excluirPrestador } from "./actions";
import PrestadoresBusca from "@/components/PrestadoresBusca";

export default async function PrestadoresPage() {
  const prestadores = await prisma.prestador.findMany({
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      especialidade: true,
      telefone: true,
      email: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Prestadores de Serviço
        </h1>
        <Link
          href="/prestadores/novo"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Novo Prestador
        </Link>
      </div>

      <PrestadoresBusca
        prestadores={prestadores}
        excluirPrestador={excluirPrestador}
      />
    </div>
  );
}
