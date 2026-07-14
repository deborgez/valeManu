"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function gerarPedidoOrcamento(
  manutencaoId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const prestadorId = String(formData.get("prestadorId"));
  const urls = formData.getAll("anexosUrl") as string[];
  const nomes = formData.getAll("anexosNome") as string[];
  const tipos = formData.getAll("anexosTipo") as string[];

  const pedido = await prisma.pedidoOrcamento.create({
    data: {
      manutencaoId,
      prestadorId,
      geradoPorId: session.user.id,
    },
  });

  for (let i = 0; i < urls.length; i++) {
    const tipo = tipos[i]?.startsWith("video/") ? "VIDEO" : "FOTO";

    await prisma.anexo.create({
      data: {
        tipo,
        path: urls[i],
        mimeType: tipos[i] || "application/octet-stream",
        filename: nomes[i] || urls[i],
        pedidoOrcamentoId: pedido.id,
      },
    });
  }

  await prisma.manutencao.updateMany({
    where: { id: manutencaoId, status: "SOLICITACAO" },
    data: { status: "AGUARDANDO_ORCAMENTO" },
  });

  revalidatePath(`/manutencoes/${manutencaoId}`);
  revalidatePath("/manutencoes");
}
