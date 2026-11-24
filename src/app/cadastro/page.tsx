import { prisma } from "@/lib/prisma";
import { formatEndereco } from "@/lib/endereco";
import { LABEL_TIPO_FIANCA } from "@/lib/labels";
import Link from "next/link";
import TabelaLista, { type LinhaLista } from "@/components/TabelaLista";

export default async function CadastroPage() {
  const processos = await prisma.processo.findMany({
    include: { partes: true },
    orderBy: { createdAt: "desc" },
  });

  const linhas: LinhaLista[] = processos.map((p) => {
    const locadores = p.partes
      .filter((parte) => parte.tipo === "LOCADOR")
      .map((l) => l.nome)
      .join(", ");
    const locatarios = p.partes
      .filter((parte) => parte.tipo === "LOCATARIO")
      .map((l) => l.nome)
      .join(", ");
    const endereco = formatEndereco(p);
    const fianca = p.tipoFianca ? LABEL_TIPO_FIANCA[p.tipoFianca] : "";

    return {
      id: p.id,
      busca: [p.numeroProcesso, p.unidade, endereco, locadores, locatarios, fianca].join(" "),
      ordenar: {
        processo: p.numeroProcesso,
        unidade: p.unidade ?? "",
        endereco,
        locador: locadores,
        locatario: locatarios,
        fianca,
      },
      linha: (
        <tr
          key={p.id}
          className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <td className="px-4 py-2">
            <Link href={`/cadastro/${p.id}`} className="font-medium hover:underline">
              {p.numeroProcesso}
            </Link>
          </td>
          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{p.unidade || "—"}</td>
          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{endereco}</td>
          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{locadores || "—"}</td>
          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{locatarios || "—"}</td>
          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{fianca || "—"}</td>
        </tr>
      ),
    };
  });

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Cadastro de Processos
        </h1>
        <div className="flex items-center gap-2">
        <Link
          href="/cadastro/importar"
          className="rounded border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Importar planilha
        </Link>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/exportar/processos"
          className="rounded border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Exportar planilha
        </a>
        <Link
          href="/cadastro/novo"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Novo Processo
        </Link>
        </div>
      </div>

      <TabelaLista
        colunas={[
          { chave: "processo", rotulo: "Processo", ordenavel: true },
          { chave: "unidade", rotulo: "Unidade", ordenavel: true },
          { chave: "endereco", rotulo: "Endereço", ordenavel: true },
          { chave: "locador", rotulo: "Locador", ordenavel: true },
          { chave: "locatario", rotulo: "Locatário", ordenavel: true },
          { chave: "fianca", rotulo: "Fiança", ordenavel: true },
        ]}
        linhas={linhas}
        vazio="Nenhum processo cadastrado ainda."
        placeholderBusca="Buscar por número, endereço, locador ou locatário"
      />
    </div>
  );
}
