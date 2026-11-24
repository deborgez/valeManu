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
    include: { prestador: true },
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

  await prisma.historicoEtapa.create({
    data: {
      manutencaoId,
      etapa: "Pedido de orçamento gerado",
      detalhe: pedido.prestador.nome,
    },
  });

  revalidatePath(`/manutencoes/${manutencaoId}`);
  revalidatePath("/manutencoes");
}

export async function adicionarAnexosPedido(
  pedidoId: string,
  manutencaoId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const urls = formData.getAll("anexosUrl") as string[];
  const nomes = formData.getAll("anexosNome") as string[];
  const tipos = formData.getAll("anexosTipo") as string[];
  if (urls.length === 0) return;

  const pedido = await prisma.pedidoOrcamento.findFirstOrThrow({
    where: { id: pedidoId, manutencaoId },
    include: { prestador: true },
  });

  for (let i = 0; i < urls.length; i++) {
    await prisma.anexo.create({
      data: {
        tipo: tipos[i]?.startsWith("video/") ? "VIDEO" : "FOTO",
        path: urls[i],
        mimeType: tipos[i] || "application/octet-stream",
        filename: nomes[i] || urls[i],
        pedidoOrcamentoId: pedido.id,
      },
    });
  }

  await prisma.historicoEtapa.create({
    data: {
      manutencaoId,
      etapa: "Fotos da solicitação alteradas",
      detalhe: `${urls.length} ${urls.length === 1 ? "arquivo adicionado" : "arquivos adicionados"} (${pedido.prestador.nome}) por ${session.user.name ?? "um usuário"}`,
    },
  });

  revalidatePath(`/manutencoes/${manutencaoId}`);
  revalidatePath(`/orcamento/${pedido.token}`);
}

export async function removerAnexoPedido(anexoId: string, manutencaoId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const anexo = await prisma.anexo.findUniqueOrThrow({
    where: { id: anexoId },
    include: { pedidoOrcamento: { include: { prestador: true } } },
  });
  if (!anexo.pedidoOrcamento || anexo.pedidoOrcamento.manutencaoId !== manutencaoId) {
    throw new Error("Anexo não pertence a esta manutenção.");
  }
  if (anexo.tipo === "ORCAMENTO") {
    throw new Error("O arquivo do orçamento enviado pelo prestador não pode ser removido aqui.");
  }

  await prisma.anexo.delete({ where: { id: anexoId } });

  await prisma.historicoEtapa.create({
    data: {
      manutencaoId,
      etapa: "Fotos da solicitação alteradas",
      detalhe: `Arquivo removido (${anexo.pedidoOrcamento.prestador.nome}) por ${session.user.name ?? "um usuário"}`,
    },
  });

  revalidatePath(`/manutencoes/${manutencaoId}`);
  revalidatePath(`/orcamento/${anexo.pedidoOrcamento.token}`);
}
