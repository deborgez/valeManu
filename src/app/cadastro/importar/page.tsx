import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { importarPrestadores, importarProcessos } from "./actions";

const SECAO =
  "mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6";

export default async function ImportarPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; criados?: string; ignorados?: string; erros?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN" && session?.user.role !== "ADMINISTRATIVO") redirect("/cadastro");
  const { tipo, criados, ignorados, erros } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Importar planilhas
        </h1>
        <Link
          href="/cadastro"
          className="text-sm text-slate-500 underline dark:text-slate-400"
        >
          Voltar ao cadastro
        </Link>
      </div>

      {tipo && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="font-medium text-slate-900 dark:text-slate-100">
            Importação de {tipo}: {criados ?? 0} cadastrados, {ignorados ?? 0} já existiam (ignorados).
          </p>
          {erros && (
            <ul className="mt-2 list-disc pl-5 text-red-700 dark:text-red-400">
              {erros.split(" | ").map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <section className={SECAO}>
        <h2 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">Prestadores</h2>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Colunas: Nome, Empresa, Especialidade, Telefone, CPF/CNPJ, E-mail, Observações. Nome,
          especialidade e telefone são obrigatórios. Quem já existe (mesmo nome e telefone) é
          ignorado.
        </p>
        <form action={importarPrestadores} className="flex flex-wrap items-center gap-3">
          <input type="file" name="arquivo" accept=".xlsx,.csv" required className="text-sm" />
          <button
            type="submit"
            className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
          >
            Importar prestadores
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/modelos/prestadores" className="text-xs text-slate-500 underline dark:text-slate-400">
            Baixar modelo
          </a>
        </form>
      </section>

      <section className={SECAO}>
        <h2 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">Processos</h2>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Uma linha por processo, com um locatário e um locador (outros podem ser adicionados depois
          no cadastro). Datas em dd/mm/aaaa. Processos já cadastrados são ignorados.
        </p>
        <form action={importarProcessos} className="flex flex-wrap items-center gap-3">
          <input type="file" name="arquivo" accept=".xlsx,.csv" required className="text-sm" />
          <button
            type="submit"
            className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
          >
            Importar processos
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/modelos/processos" className="text-xs text-slate-500 underline dark:text-slate-400">
            Baixar modelo
          </a>
        </form>
      </section>
    </div>
  );
}
