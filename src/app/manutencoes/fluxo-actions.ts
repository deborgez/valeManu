"use server";

import { prisma } from "@/lib/prisma";
import { parseMoeda } from "@/lib/masks";
import { revalidatePath } from "next/cache";

async function revalidarManutencao(manutencaoId: string) {
  revalidatePath(`/manutencoes/${manutencaoId}`);
  revalidatePath("/manutencoes");
}

async function registrarHistorico(
  manutencaoId: string,
  etapa: string,
  detalhe?: string | null
) {
  await prisma.historicoEtapa.create({
    data: { manutencaoId, etapa, detalhe: detalhe || null },
  });
}

export async function entregarOrcamento(
  pedidoId: string,
  manutencaoId: string,
  formData: FormData
) {
  const arquivoUrl = formData.get("arquivoOrcamentoUrl") as string | null;
  const arquivoNome = formData.get("arquivoOrcamentoNome") as string | null;
  const arquivoTipo = formData.get("arquivoOrcamentoTipo") as string | null;

  const pedido = await prisma.pedidoOrcamento.update({
    where: { id: pedidoId },
    data: {
      valorMaoDeObra: parseMoeda(formData.get("valorMaoDeObra")),
      valorMaterial: parseMoeda(formData.get("valorMaterial")),
      descricaoServico: String(formData.get("descricaoServico") || ""),
      status: "ENTREGUE_AGUARDANDO_APROVACAO",
      entregueEm: new Date(),
    },
    include: { prestador: true },
  });

  if (arquivoUrl) {
    await prisma.anexo.create({
      data: {
        tipo: "ORCAMENTO",
        path: arquivoUrl,
        mimeType: arquivoTipo || "application/octet-stream",
        filename: arquivoNome || arquivoUrl,
        pedidoOrcamentoId: pedidoId,
      },
    });
  }

  await prisma.manutencao.update({
    where: { id: manutencaoId },
    data: { status: "AGUARDANDO_APROVACAO" },
  });

  await registrarHistorico(
    manutencaoId,
    "Orçamento entregue",
    pedido.prestador.nome
  );

  await revalidarManutencao(manutencaoId);
}

export async function marcarOrcamentoNaoEntregue(
  pedidoId: string,
  manutencaoId: string
) {
  const pedido = await prisma.pedidoOrcamento.update({
    where: { id: pedidoId },
    data: { status: "NAO_ENTREGUE" },
    include: { prestador: true },
  });
  await registrarHistorico(
    manutencaoId,
    "Orçamento não entregue",
    pedido.prestador.nome
  );
  await revalidarManutencao(manutencaoId);
}

export async function aprovarPedido(pedidoId: string, manutencaoId: string) {
  const pedido = await prisma.pedidoOrcamento.update({
    where: { id: pedidoId },
    data: { status: "APROVADO" },
    include: { prestador: true },
  });

  // Pedidos concorrentes ainda pendentes de aprovação são superados.
  await prisma.pedidoOrcamento.updateMany({
    where: {
      manutencaoId,
      status: "ENTREGUE_AGUARDANDO_APROVACAO",
      id: { not: pedidoId },
    },
    data: { status: "REPROVADO" },
  });

  await prisma.manutencao.update({
    where: { id: manutencaoId },
    data: { status: "APROVADA" },
  });

  await registrarHistorico(
    manutencaoId,
    "Serviço aprovado",
    pedido.prestador.nome
  );

  await revalidarManutencao(manutencaoId);
}

export async function reprovarPedido(pedidoId: string, manutencaoId: string) {
  const pedido = await prisma.pedidoOrcamento.update({
    where: { id: pedidoId },
    data: { status: "REPROVADO" },
    include: { prestador: true },
  });
  await registrarHistorico(
    manutencaoId,
    "Serviço reprovado",
    pedido.prestador.nome
  );
  await revalidarManutencao(manutencaoId);
}

export async function iniciarServicoImediato(
  manutencaoId: string,
  pedidoOrcamentoAprovadoId: string
) {
  await prisma.inicioServico.create({
    data: {
      manutencaoId,
      pedidoOrcamentoAprovadoId,
      tipo: "IMEDIATO",
      status: "INICIADO_ANDAMENTO",
    },
  });

  await prisma.manutencao.update({
    where: { id: manutencaoId },
    data: { status: "EM_ANDAMENTO" },
  });

  await registrarHistorico(manutencaoId, "Serviço iniciado", "Início imediato");

  await revalidarManutencao(manutencaoId);
}

export async function agendarServico(
  manutencaoId: string,
  pedidoOrcamentoAprovadoId: string,
  formData: FormData
) {
  const data = String(formData.get("data"));
  const hora = String(formData.get("hora"));
  const dataHoraAgendada = new Date(`${data}T${hora}`);

  await prisma.inicioServico.create({
    data: {
      manutencaoId,
      pedidoOrcamentoAprovadoId,
      tipo: "AGENDADO",
      status: "AGENDADO",
      dataHoraAgendada,
    },
  });

  await prisma.manutencao.update({
    where: { id: manutencaoId },
    data: { status: "AGENDADA" },
  });

  await registrarHistorico(
    manutencaoId,
    "Serviço agendado",
    dataHoraAgendada.toLocaleString("pt-BR")
  );

  await revalidarManutencao(manutencaoId);
}

export async function concluirServico(
  manutencaoId: string,
  formData: FormData
) {
  const observacoes = (formData.get("observacoes") as string) || null;

  await prisma.conclusaoServico.create({
    data: { manutencaoId, observacoes },
  });

  await prisma.manutencao.update({
    where: { id: manutencaoId },
    data: { status: "CONCLUIDA" },
  });

  await registrarHistorico(manutencaoId, "Serviço concluído", observacoes);

  await revalidarManutencao(manutencaoId);
}

export async function reabrirServico(manutencaoId: string, formData: FormData) {
  const motivo = String(formData.get("motivo") || "").trim();
  if (!motivo) throw new Error("Informe o motivo da reabertura.");

  await prisma.manutencao.update({
    where: { id: manutencaoId },
    data: { status: "AGUARDANDO_ORCAMENTO", reaberta: true },
  });

  await registrarHistorico(manutencaoId, "Serviço reaberto", motivo);

  await revalidarManutencao(manutencaoId);
}
