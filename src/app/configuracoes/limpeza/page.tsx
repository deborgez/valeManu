import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatData } from "@/lib/datahora";
import { LABEL_TIPO_VISTORIA } from "@/lib/vistorias";
import LimpezaVistorias from "@/components/LimpezaVistorias";
import { excluirVistorias } from "./actions";

export default async function LimpezaPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const vistorias = await prisma.vistoria.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      processo: { select: { numeroProcesso: true } },
      solicitadoPor: { select: { nome: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Limpeza de dados
      </h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Vistorias cadastradas no sistema. As marcadas como <strong>TESTE</strong> já vêm
        selecionadas. Confira a seleção antes de excluir: a exclusão é definitiva.
      </p>

      <LimpezaVistorias
        onExcluir={excluirVistorias}
        vistorias={vistorias.map((v) => ({
          id: v.id,
          tipo: LABEL_TIPO_VISTORIA[v.tipo],
          processo: v.processo.numeroProcesso,
          solicitadaEm: formatData(v.createdAt),
          solicitante: v.solicitadoPor.nome,
          situacao: v.status === "ENTREGUE" ? "Entregue" : "Pendente",
          marcadaTeste: (v.comprovanteNome ?? "").toUpperCase().startsWith("TESTE"),
        }))}
      />
    </div>
  );
}
