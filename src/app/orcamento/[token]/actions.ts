"use server";

import { prisma } from "@/lib/prisma";
import { parseMoeda } from "@/lib/masks";
import { revalidatePath } from "next/cache";
import { notificar } from "@/lib/notificacoes";

export async function enviarOrcamentoProfissional(
  token: string,
  formData: FormData
) {
  const pedido = await prisma.pedidoOrcamento.findUnique({
    where: { token },
  });
  if (!pedido) throw new Error("Pedido não encontrado.");

  const arquivoUrl = formData.get("arquivoOrcamentoUrl") as string | null;
  const arquivoNome = formData.get("arquivoOrcamentoNome") as string | null;
  const arquivoTipo = formData.get("arquivoOrcamentoTipo") as string | null;

  await prisma.pedidoOrcamento.update({
    where: { token },
    data: {
      valorMaoDeObra: parseMoeda(formData.get("valorMaoDeObra")),
      valorMaterial: parseMoeda(formData.get("valorMaterial")),
      descricaoServico: String(formData.get("descricaoServico") || ""),
      status: "ENTREGUE_AGUARDANDO_APROVACAO",
      entregueEm: new Date(),
    },
  });

  if (arquivoUrl) {
    await prisma.anexo.create({
      data: {
        tipo: "ORCAMENTO",
        path: arquivoUrl,
        mimeType: arquivoTipo || "application/octet-stream",
        filename: arquivoNome || arquivoUrl,
        pedidoOrcamentoId: pedido.id,
      },
    });
  }

  await prisma.manutencao.update({
    where: { id: pedido.manutencaoId },
    data: { status: "AGUARDANDO_APROVACAO" },
  });

  const manutencao = await prisma.manutencao.findUnique({
    where: { id: pedido.manutencaoId },
    select: { numeroProcesso: true },
  });
  await notificar({
    perfis: ["ADMIN", "ADMINISTRATIVO"],
    mensagem: `Manutenção ${manutencao?.numeroProcesso ?? ""}: orçamento entregue pelo prestador`,
    link: `/manutencoes/${pedido.manutencaoId}`,
  });

  revalidatePath(`/orcamento/${token}`);
  revalidatePath(`/manutencoes/${pedido.manutencaoId}`);
}

export async function responderContraoferta(token: string, aceitar: boolean) {
  const pedido = await prisma.pedidoOrcamento.findUnique({ where: { token } });
  if (!pedido) throw new Error("Pedido não encontrado.");
  if (pedido.status !== "CONTRAOFERTA_ENVIADA") return;

  if (aceitar) {
    await prisma.pedidoOrcamento.update({
      where: { token },
      data: {
        valorMaoDeObra: pedido.contraOfertaValorMaoDeObra,
        valorMaterial: pedido.contraOfertaValorMaterial,
        status: "ENTREGUE_AGUARDANDO_APROVACAO",
      },
    });
    await prisma.historicoEtapa.create({
      data: { manutencaoId: pedido.manutencaoId, etapa: "Contraoferta aceita" },
    });
  } else {
    await prisma.pedidoOrcamento.update({
      where: { token },
      data: {
        status: "ENTREGUE_AGUARDANDO_APROVACAO",
        contraOfertaRecusada: true,
      },
    });
    await prisma.historicoEtapa.create({
      data: { manutencaoId: pedido.manutencaoId, etapa: "Contraoferta recusada" },
    });
  }

  const manutencao = await prisma.manutencao.findUnique({
    where: { id: pedido.manutencaoId },
    select: { numeroProcesso: true },
  });
  await notificar({
    perfis: ["ADMIN", "ADMINISTRATIVO"],
    mensagem: `Manutenção ${manutencao?.numeroProcesso ?? ""}: prestador ${aceitar ? "aceitou" : "recusou"} a contraoferta`,
    link: `/manutencoes/${pedido.manutencaoId}`,
  });

  revalidatePath(`/orcamento/${token}`);
  revalidatePath(`/manutencoes/${pedido.manutencaoId}`);
}
