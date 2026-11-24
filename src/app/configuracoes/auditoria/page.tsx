import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDataHora } from "@/lib/datahora";
import { LABEL_ENTIDADE, type EntidadeAuditoria } from "@/lib/auditoria";
import TabelaLista, { type LinhaLista } from "@/components/TabelaLista";

export default async function AuditoriaPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const registros = await prisma.auditoriaGeral.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  const linhas: LinhaLista[] = registros.map((r) => {
    const entidade = LABEL_ENTIDADE[r.entidade as EntidadeAuditoria] ?? r.entidade;
    return {
      id: r.id,
      busca: [entidade, r.referencia, r.acao, r.detalhe, r.usuarioNome, formatDataHora(r.createdAt)].join(" "),
      ordenar: {
        quando: r.createdAt.getTime(),
        usuario: r.usuarioNome,
        acao: r.acao,
        item: entidade,
        referencia: r.referencia ?? "",
      },
      linha: (
        <tr key={r.id} className="border-t border-slate-100 align-top dark:border-slate-700">
          <td className="whitespace-nowrap px-4 py-2 text-slate-500 dark:text-slate-400">
            {formatDataHora(r.createdAt)}
          </td>
          <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{r.usuarioNome}</td>
          <td className="px-4 py-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              {r.acao}
            </span>
          </td>
          <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
            {entidade}
            {r.referencia && (
              <span className="block text-xs text-slate-400 dark:text-slate-500">{r.referencia}</span>
            )}
          </td>
          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{r.detalhe ?? "—"}</td>
        </tr>
      ),
    };
  });

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">Auditoria</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Registro de quem criou, editou, excluiu ou concluiu itens em processos, prestadores,
        usuários, vistorias, manutenções e importações. Mostra os últimos 1.000 registros. O
        histórico de cada distrato fica na própria tela do distrato.
      </p>

      <TabelaLista
        colunas={[
          { chave: "quando", rotulo: "Quando", ordenavel: true },
          { chave: "usuario", rotulo: "Usuário", ordenavel: true },
          { chave: "acao", rotulo: "Ação", ordenavel: true },
          { chave: "item", rotulo: "Item", ordenavel: true },
          { chave: "detalhe", rotulo: "Detalhe" },
        ]}
        linhas={linhas}
        vazio="Nenhum registro ainda. As ações feitas a partir de agora aparecem aqui."
        porPagina={25}
        ordemInicial={{ chave: "quando", direcao: "desc" }}
        placeholderBusca="Buscar por usuário, ação, processo ou detalhe"
      />
    </div>
  );
}
