"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { registrarAuditoria } from "@/lib/auditoria";

export async function excluirVistorias(ids: string[]) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Apenas administradores podem limpar dados.");
  }
  if (ids.length === 0) return;

  const vistorias = await prisma.vistoria.findMany({
    where: { id: { in: ids } },
    include: { processo: { select: { numeroProcesso: true } } },
  });

  for (const v of vistorias) {
    if (v.distratoId) {
      await prisma.distratoAuditoria.create({
        data: {
          distratoId: v.distratoId,
          secao: "SOLICITACAO_VISTORIA_SAIDA",
          acao: "Excluiu",
          detalhe: "Vistoria de saída removida pelo administrador (limpeza de dados)",
          usuarioId: session.user.id,
        },
      });
    }
  }

  await prisma.vistoria.deleteMany({ where: { id: { in: vistorias.map((v) => v.id) } } });
  await registrarAuditoria({
    entidade: "SISTEMA",
    acao: "Excluiu",
    detalhe: `Limpeza de dados: ${vistorias.length} ${vistorias.length === 1 ? "vistoria removida" : "vistorias removidas"} (${vistorias.map((v) => v.processo.numeroProcesso).join(", ")})`,
  });

  revalidatePath("/configuracoes/limpeza");
  revalidatePath("/vistorias/entrada");
  revalidatePath("/vistorias/saida");
  revalidatePath("/vistorias/solicitacoes");
  revalidatePath("/vistorias/relatorios");
  for (const v of vistorias) if (v.distratoId) revalidatePath(`/distrato/${v.distratoId}`);
}
