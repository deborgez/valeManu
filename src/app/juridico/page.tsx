import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatData } from "@/lib/datahora";
import { formatMoedaExibicao } from "@/lib/masks";

export default async function JuridicoPage() {
  const distratos = await prisma.distrato.findMany({
    where: { enviadoJuridico: true },
    include: {
      processo: { select: { numeroProcesso: true } },
      enviadoJuridicoPor: { select: { nome: true } },
      acordo: { select: { valorFinal: true, numeroParcelas: true } },
    },
    orderBy: { dataEnvioJuridico: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Jurídico
      </h1>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Processo</th>
              <th className="px-4 py-2">Enviado em</th>
              <th className="px-4 py-2">Enviado por</th>
              <th className="px-4 py-2">Motivo</th>
              <th className="px-4 py-2">Acordo</th>
            </tr>
          </thead>
          <tbody>
            {distratos.map((d) => (
              <tr
                key={d.id}
                className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <td className="px-4 py-2">
                  <Link href={`/juridico/${d.id}`} className="font-medium hover:underline">
                    {d.processo.numeroProcesso}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  {d.dataEnvioJuridico ? formatData(d.dataEnvioJuridico) : "—"}
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  {d.enviadoJuridicoPor?.nome ?? "—"}
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  {d.motivoJuridico ?? "—"}
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  {d.acordo
                    ? `R$ ${formatMoedaExibicao(d.acordo.valorFinal)} em ${d.acordo.numeroParcelas}x`
                    : "Sem acordo"}
                </td>
              </tr>
            ))}
            {distratos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Nenhum processo enviado para o Jurídico ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
