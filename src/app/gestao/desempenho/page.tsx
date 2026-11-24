import { prisma } from "@/lib/prisma";
import { LABEL_PERFIL } from "@/lib/perfis";
import { diasUteisAteEntrega } from "@/lib/vistorias";

function media(valores: number[]): number | null {
  return valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
}

function formatar(n: number | null, unidade: string): string {
  if (n === null) return "—";
  const texto = Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
  return `${texto} ${unidade}`;
}

export default async function DesempenhoPage() {
  const [usuarios, manutencoes, vistorias, distratos] = await Promise.all([
    prisma.user.findMany({ select: { id: true, nome: true, role: true }, orderBy: { nome: "asc" } }),
    prisma.manutencao.findMany({
      where: { status: { not: "CANCELADA" } },
      select: {
        criadoPorId: true,
        createdAt: true,
        conclusoesServico: { select: { dataConclusao: true }, orderBy: { dataConclusao: "desc" }, take: 1 },
      },
    }),
    prisma.vistoria.findMany({
      select: {
        solicitadoPorId: true,
        entreguePorId: true,
        status: true,
        createdAt: true,
        entregueData: true,
      },
    }),
    prisma.distrato.findMany({ select: { criadoPorId: true } }),
  ]);

  const linhas = usuarios.map((u) => {
    const minhasManutencoes = manutencoes.filter((m) => m.criadoPorId === u.id);
    const tempos = minhasManutencoes.flatMap((m) =>
      m.conclusoesServico[0]
        ? [(m.conclusoesServico[0].dataConclusao.getTime() - m.createdAt.getTime()) / 86400000]
        : []
    );
    const vistoriasSolicitadas = vistorias.filter((v) => v.solicitadoPorId === u.id).length;
    const entregues = vistorias.filter((v) => v.entreguePorId === u.id && v.status === "ENTREGUE");
    const duracoes = entregues
      .map((v) => diasUteisAteEntrega(v))
      .filter((d): d is number => d !== null);

    return {
      id: u.id,
      nome: u.nome,
      perfil: LABEL_PERFIL[u.role] ?? u.role,
      manutencoes: minhasManutencoes.length,
      concluidas: tempos.length,
      tempoMedioManutencao: media(tempos),
      distratos: distratos.filter((d) => d.criadoPorId === u.id).length,
      vistoriasSolicitadas,
      vistoriasEntregues: entregues.length,
      tempoMedioVistoria: media(duracoes),
    };
  });

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Desempenho da equipe
      </h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Resumo por usuário: o que cada um abriu e concluiu, e em quanto tempo.
      </p>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Usuário</th>
              <th className="px-4 py-2">Manutenções abertas</th>
              <th className="px-4 py-2">Tempo médio até concluir</th>
              <th className="px-4 py-2">Distratos iniciados</th>
              <th className="px-4 py-2">Vistorias solicitadas</th>
              <th className="px-4 py-2">Vistorias entregues</th>
              <th className="px-4 py-2">Tempo médio de entrega</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.id} className="border-t border-slate-100 dark:border-slate-700">
                <td className="px-4 py-2">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{l.nome}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{l.perfil}</p>
                </td>
                <td className="px-4 py-2">
                  {l.manutencoes}
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {" "}
                    ({l.concluidas} concluídas)
                  </span>
                </td>
                <td className="px-4 py-2">{formatar(l.tempoMedioManutencao, "dias")}</td>
                <td className="px-4 py-2">{l.distratos}</td>
                <td className="px-4 py-2">{l.vistoriasSolicitadas}</td>
                <td className="px-4 py-2">{l.vistoriasEntregues}</td>
                <td className="px-4 py-2">{formatar(l.tempoMedioVistoria, "dias úteis")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
