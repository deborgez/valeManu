"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { parseDataLocal } from "@/lib/datahora";

async function logAuditoria(distratoId: string, acao: string, detalhe?: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  await prisma.distratoAuditoria.create({
    data: {
      distratoId,
      secao: "JURIDICO",
      acao,
      detalhe: detalhe ?? null,
      usuarioId: session.user.id,
    },
  });
}

function revalidarJuridico(distratoId: string) {
  revalidatePath(`/distrato/${distratoId}`);
  revalidatePath(`/juridico/${distratoId}`);
  revalidatePath("/juridico");
}

export async function enviarParaJuridico(distratoId: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const motivo = (formData.get("motivo") as string) || null;

  await prisma.distrato.update({
    where: { id: distratoId },
    data: {
      enviadoJuridico: true,
      dataEnvioJuridico: new Date(),
      motivoJuridico: motivo,
      enviadoJuridicoPorId: session.user.id,
      faseJuridica: "ANALISE",
    },
  });

  await logAuditoria(
    distratoId,
    "Enviou",
    motivo ? `Enviado para o Jurídico: ${motivo}` : "Enviado para o Jurídico."
  );
  revalidarJuridico(distratoId);
}

export async function retirarDoJuridico(distratoId: string) {
  await prisma.distrato.update({
    where: { id: distratoId },
    data: {
      enviadoJuridico: false,
      dataEnvioJuridico: null,
      motivoJuridico: null,
      enviadoJuridicoPorId: null,
      faseJuridica: "ANALISE",
    },
  });

  await logAuditoria(distratoId, "Editou", "Retirado do Jurídico.");
  revalidarJuridico(distratoId);
}

export async function registrarTratativa(distratoId: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const tratativa = await prisma.tratativaJuridica.create({
    data: {
      distratoId,
      parte: formData.get("parte") as "LOCADOR" | "LOCATARIO" | "FIADOR",
      descricao: String(formData.get("descricao")),
      data: parseDataLocal(String(formData.get("data"))),
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
      criadoPorId: session.user.id,
    },
  });

  await logAuditoria(distratoId, "Registrou", `Tratativa registrada (${tratativa.parte}).`);
  revalidarJuridico(distratoId);
}

export async function excluirTratativa(id: string, distratoId: string) {
  await prisma.tratativaJuridica.delete({ where: { id } });
  await logAuditoria(distratoId, "Excluiu", "Tratativa excluída.");
  revalidarJuridico(distratoId);
}

export async function registrarNotificacao(distratoId: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const notificacao = await prisma.notificacaoJuridica.create({
    data: {
      distratoId,
      parte: formData.get("parte") as "LOCADOR" | "LOCATARIO" | "FIADOR",
      meio: formData.get("meio") as "AR" | "CARTORIO" | "WHATSAPP" | "EMAIL" | "OUTRO",
      descricao: String(formData.get("descricao")),
      data: parseDataLocal(String(formData.get("data"))),
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
      criadoPorId: session.user.id,
    },
  });

  await logAuditoria(
    distratoId,
    "Registrou",
    `Notificação registrada (${notificacao.parte} — ${notificacao.meio}).`
  );
  revalidarJuridico(distratoId);
}

export async function excluirNotificacao(id: string, distratoId: string) {
  await prisma.notificacaoJuridica.delete({ where: { id } });
  await logAuditoria(distratoId, "Excluiu", "Notificação excluída.");
  revalidarJuridico(distratoId);
}

export async function enviarParaExecucao(distratoId: string) {
  await prisma.distrato.update({
    where: { id: distratoId },
    data: { faseJuridica: "EXECUCAO" },
  });

  await logAuditoria(distratoId, "Enviou", "Processo enviado para Execução.");
  revalidarJuridico(distratoId);
}
