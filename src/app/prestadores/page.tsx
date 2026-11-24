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
      empresa: true,
      especialidade: true,
      telefone: true,
      email: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Prestadores de Serviço
        </h1>
        <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/exportar/prestadores"
          className="rounded border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Exportar planilha
        </a>
        <Link
          href="/prestadores/novo"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Novo Prestador
        </Link>
        </div>
      </div>

      <PrestadoresBusca
        prestadores={prestadores}
        excluirPrestador={excluirPrestador}
      />
    </div>
  );
}
