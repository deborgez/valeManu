"use server";

import { prisma } from "@/lib/prisma";
import { parseMoeda } from "@/lib/masks";
import { revalidatePath } from "next/cache";

async function revalidarManutencao(manutencaoId: string) {
  revalidatePath(`/manutencoes/${manutencaoId}`);
  revalidatePath("/manutencoes");
}

export async function entregarOrcamento(
  pedidoId: string,
  manutencaoId: string,
  formData: FormData
) {
  const arquivoUrl = formData.get("arquivoOrcamentoUrl") as string | null;
  const arquivoNome = formData.get("arquivoOrcamentoNome") as string | null;
  const arquivoTipo = formData.get("arquivoOrcamentoTipo") as string | null;

  await prisma.pedidoOrcamento.update({
    where: { id: pedidoId },
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
        pedidoOrcamentoId: pedidoId,
      },
    });
  }

  await prisma.manutencao.update({
    where: { id: manutencaoId },
    data: { status: "AGUARDANDO_APROVACAO" },
  });

  await revalidarManutencao(manutencaoId);
}

export async function marcarOrcamentoNaoEntregue(
  pedidoId: string,
  manutencaoId: string
) {
  await prisma.pedidoOrcamento.update({
    where: { id: pedidoId },
    data: { status: "NAO_ENTREGUE" },
  });
  await revalidarManutencao(manutencaoId);
}

export async function aprovarPedido(pedidoId: string, manutencaoId: string) {
  await prisma.pedidoOrcamento.update({
    where: { id: pedidoId },
    data: { status: "APROVADO" },
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

  await revalidarManutencao(manutencaoId);
}

export async function reprovarPedido(pedidoId: string, manutencaoId: string) {
  await prisma.pedidoOrcamento.update({
    where: { id: pedidoId },
    data: { status: "REPROVADO" },
  });
  await revalidarManutencao(manutencaoId);
}

export async function iniciarServicoImediato(
  manutencaoId: string,
  pedidoOrcamentoAprovadoId: string
) {
  await prisma.inicioServico.upsert({
    where: { manutencaoId },
    update: {
      tipo: "IMEDIATO",
      status: "INICIADO_ANDAMENTO",
      dataHoraAgendada: null,
      pedidoOrcamentoAprovadoId,
    },
    create: {
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

  await prisma.inicioServico.upsert({
    where: { manutencaoId },
    update: {
      tipo: "AGENDADO",
      status: "AGENDADO",
      dataHoraAgendada,
      pedidoOrcamentoAprovadoId,
    },
    create: {
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

  await revalidarManutencao(manutencaoId);
}

export async function concluirServico(
  manutencaoId: string,
  formData: FormData
) {
  const observacoes = (formData.get("observacoes") as string) || null;

  await prisma.conclusaoServico.upsert({
    where: { manutencaoId },
    update: { observacoes, dataConclusao: new Date() },
    create: { manutencaoId, observacoes },
  });

  await prisma.manutencao.update({
    where: { id: manutencaoId },
    data: { status: "CONCLUIDA" },
  });

  await revalidarManutencao(manutencaoId);
}

export async function reabrirServico(manutencaoId: string) {
  await prisma.manutencao.update({
    where: { id: manutencaoId },
    data: { status: "EM_ANDAMENTO", reaberta: true },
  });

  await revalidarManutencao(manutencaoId);
}
