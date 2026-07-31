"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const SECAO = {
  AVISO_PREVIO: "AVISO_PREVIO",
  COMUNICADO: "COMUNICADO",
  ACOMPANHAMENTO: "ACOMPANHAMENTO",
  AGENDAMENTO_VISTORIA: "AGENDAMENTO_VISTORIA",
  ENTREGA_CHAVES: "ENTREGA_CHAVES",
  VISTORIA_SAIDA: "VISTORIA_SAIDA",
} as const;

async function logAuditoria(
  distratoId: string,
  secao: string,
  acao: string,
  detalhe?: string
) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  await prisma.distratoAuditoria.create({
    data: {
      distratoId,
      secao,
      acao,
      detalhe: detalhe ?? null,
      usuarioId: session.user.id,
    },
  });
}

export async function criarDistrato(processoId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const distrato = await prisma.distrato.create({
    data: { processoId, criadoPorId: session.user.id },
  });

  redirect(`/distrato/${distrato.id}`);
}

export async function registrarAvisoPrevio(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  const data = new Date(`${dataStr}T00:00:00`);

  await prisma.avisoPrevioLocatario.create({
    data: {
      distratoId,
      data,
      forma: formData.get("forma") as "EMAIL" | "WHATSAPP" | "TERMO",
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
    },
  });

  await logAuditoria(distratoId, SECAO.AVISO_PREVIO, "Registrou");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarAvisoPrevio(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  const data = new Date(`${dataStr}T00:00:00`);

  await prisma.avisoPrevioLocatario.update({
    where: { distratoId },
    data: {
      data,
      forma: formData.get("forma") as "EMAIL" | "WHATSAPP" | "TERMO",
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
    },
  });

  await logAuditoria(distratoId, SECAO.AVISO_PREVIO, "Editou");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirAvisoPrevio(distratoId: string) {
  await prisma.avisoPrevioLocatario.delete({ where: { distratoId } });
  await logAuditoria(distratoId, SECAO.AVISO_PREVIO, "Excluiu");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function registrarComunicado(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  const data = new Date(`${dataStr}T00:00:00`);

  const distrato = await prisma.distrato.findUniqueOrThrow({
    where: { id: distratoId },
    include: { avisoPrevio: true },
  });

  if (distrato.avisoPrevio && data < distrato.avisoPrevio.data) {
    redirect(`/distrato/${distratoId}?erroComunicado=1`);
  }

  await prisma.comunicadoLocador.create({
    data: {
      distratoId,
      data,
      forma: formData.get("forma") as "EMAIL" | "WHATSAPP" | "TERMO",
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
    },
  });

  await logAuditoria(distratoId, SECAO.COMUNICADO, "Registrou");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarComunicado(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  const data = new Date(`${dataStr}T00:00:00`);

  const distrato = await prisma.distrato.findUniqueOrThrow({
    where: { id: distratoId },
    include: { avisoPrevio: true },
  });

  if (distrato.avisoPrevio && data < distrato.avisoPrevio.data) {
    redirect(`/distrato/${distratoId}?erroComunicado=1`);
  }

  await prisma.comunicadoLocador.update({
    where: { distratoId },
    data: {
      data,
      forma: formData.get("forma") as "EMAIL" | "WHATSAPP" | "TERMO",
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
    },
  });

  await logAuditoria(distratoId, SECAO.COMUNICADO, "Editou");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirComunicado(distratoId: string) {
  await prisma.comunicadoLocador.delete({ where: { distratoId } });
  await logAuditoria(distratoId, SECAO.COMUNICADO, "Excluiu");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function registrarContato(distratoId: string, formData: FormData) {
  const dataPrevistaEntregaChaves = formData.get("dataPrevistaEntregaChaves")
    ? new Date(`${formData.get("dataPrevistaEntregaChaves")}T00:00:00`)
    : null;
  const dataPrevistaVistoriaSaida = formData.get("dataPrevistaVistoriaSaida")
    ? new Date(`${formData.get("dataPrevistaVistoriaSaida")}T00:00:00`)
    : null;

  await prisma.contatoAcompanhamento.create({
    data: {
      distratoId,
      forma: formData.get("forma") as "LIGACAO" | "WHATSAPP",
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
      dataPrevistaEntregaChaves,
      dataPrevistaVistoriaSaida,
      anotacoes: (formData.get("anotacoes") as string) || null,
    },
  });

  await logAuditoria(distratoId, SECAO.ACOMPANHAMENTO, "Registrou");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarContato(
  contatoId: string,
  distratoId: string,
  formData: FormData
) {
  const dataPrevistaEntregaChaves = formData.get("dataPrevistaEntregaChaves")
    ? new Date(`${formData.get("dataPrevistaEntregaChaves")}T00:00:00`)
    : null;
  const dataPrevistaVistoriaSaida = formData.get("dataPrevistaVistoriaSaida")
    ? new Date(`${formData.get("dataPrevistaVistoriaSaida")}T00:00:00`)
    : null;

  await prisma.contatoAcompanhamento.update({
    where: { id: contatoId },
    data: {
      forma: formData.get("forma") as "LIGACAO" | "WHATSAPP",
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
      dataPrevistaEntregaChaves,
      dataPrevistaVistoriaSaida,
      anotacoes: (formData.get("anotacoes") as string) || null,
    },
  });

  await logAuditoria(distratoId, SECAO.ACOMPANHAMENTO, "Editou");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirContato(contatoId: string, distratoId: string) {
  await prisma.contatoAcompanhamento.delete({ where: { id: contatoId } });
  await logAuditoria(distratoId, SECAO.ACOMPANHAMENTO, "Excluiu");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function agendarVistoriaSaida(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  const data = new Date(`${dataStr}T00:00:00`);
  const comunicacaoDataStr = formData.get("comunicacaoData") as string | null;
  const locadorNaoQuerParticipar = formData.get("locadorNaoQuerParticipar") === "on";

  await prisma.agendamentoVistoriaSaida.create({
    data: {
      distratoId,
      data,
      comunicacaoData: comunicacaoDataStr
        ? new Date(`${comunicacaoDataStr}T00:00:00`)
        : null,
      comunicacaoArquivoUrl: (formData.get("comunicacaoArquivoUrl") as string) || null,
      comunicacaoArquivoNome: (formData.get("comunicacaoArquivoNome") as string) || null,
      comunicacaoArquivoTipo: (formData.get("comunicacaoArquivoTipo") as string) || null,
      locadorNaoQuerParticipar,
      naoParticiparArquivoUrl: (formData.get("naoParticiparArquivoUrl") as string) || null,
      naoParticiparArquivoNome: (formData.get("naoParticiparArquivoNome") as string) || null,
      naoParticiparArquivoTipo: (formData.get("naoParticiparArquivoTipo") as string) || null,
    },
  });

  await logAuditoria(distratoId, SECAO.AGENDAMENTO_VISTORIA, "Registrou");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarAgendamentoVistoria(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  const data = new Date(`${dataStr}T00:00:00`);
  const comunicacaoDataStr = formData.get("comunicacaoData") as string | null;
  const locadorNaoQuerParticipar = formData.get("locadorNaoQuerParticipar") === "on";

  await prisma.agendamentoVistoriaSaida.update({
    where: { distratoId },
    data: {
      data,
      comunicacaoData: comunicacaoDataStr
        ? new Date(`${comunicacaoDataStr}T00:00:00`)
        : null,
      comunicacaoArquivoUrl: (formData.get("comunicacaoArquivoUrl") as string) || null,
      comunicacaoArquivoNome: (formData.get("comunicacaoArquivoNome") as string) || null,
      comunicacaoArquivoTipo: (formData.get("comunicacaoArquivoTipo") as string) || null,
      locadorNaoQuerParticipar,
      naoParticiparArquivoUrl: (formData.get("naoParticiparArquivoUrl") as string) || null,
      naoParticiparArquivoNome: (formData.get("naoParticiparArquivoNome") as string) || null,
      naoParticiparArquivoTipo: (formData.get("naoParticiparArquivoTipo") as string) || null,
    },
  });

  await logAuditoria(distratoId, SECAO.AGENDAMENTO_VISTORIA, "Editou");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirAgendamentoVistoria(distratoId: string) {
  await prisma.agendamentoVistoriaSaida.delete({ where: { distratoId } });
  await logAuditoria(distratoId, SECAO.AGENDAMENTO_VISTORIA, "Excluiu");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function registrarEntregaChaves(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  const data = new Date(`${dataStr}T00:00:00`);
  const informeDataStr = formData.get("informeData") as string | null;

  await prisma.entregaChaves.create({
    data: {
      distratoId,
      data,
      termoUrl: (formData.get("termoUrl") as string) || null,
      termoNome: (formData.get("termoNome") as string) || null,
      termoTipo: (formData.get("termoTipo") as string) || null,
      informeData: informeDataStr ? new Date(`${informeDataStr}T00:00:00`) : null,
      informeArquivoUrl: (formData.get("informeArquivoUrl") as string) || null,
      informeArquivoNome: (formData.get("informeArquivoNome") as string) || null,
      informeArquivoTipo: (formData.get("informeArquivoTipo") as string) || null,
    },
  });

  await logAuditoria(distratoId, SECAO.ENTREGA_CHAVES, "Registrou");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarEntregaChaves(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  const data = new Date(`${dataStr}T00:00:00`);
  const informeDataStr = formData.get("informeData") as string | null;

  await prisma.entregaChaves.update({
    where: { distratoId },
    data: {
      data,
      termoUrl: (formData.get("termoUrl") as string) || null,
      termoNome: (formData.get("termoNome") as string) || null,
      termoTipo: (formData.get("termoTipo") as string) || null,
      informeData: informeDataStr ? new Date(`${informeDataStr}T00:00:00`) : null,
      informeArquivoUrl: (formData.get("informeArquivoUrl") as string) || null,
      informeArquivoNome: (formData.get("informeArquivoNome") as string) || null,
      informeArquivoTipo: (formData.get("informeArquivoTipo") as string) || null,
    },
  });

  await logAuditoria(distratoId, SECAO.ENTREGA_CHAVES, "Editou");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirEntregaChaves(distratoId: string) {
  await prisma.entregaChaves.delete({ where: { distratoId } });
  await logAuditoria(distratoId, SECAO.ENTREGA_CHAVES, "Excluiu");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function registrarVistoriaSaida(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  const data = new Date(`${dataStr}T00:00:00`);

  await prisma.vistoriaSaida.create({
    data: {
      distratoId,
      data,
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
    },
  });

  await logAuditoria(distratoId, SECAO.VISTORIA_SAIDA, "Registrou");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarVistoriaSaida(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  const data = new Date(`${dataStr}T00:00:00`);

  await prisma.vistoriaSaida.update({
    where: { distratoId },
    data: {
      data,
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
    },
  });

  await logAuditoria(distratoId, SECAO.VISTORIA_SAIDA, "Editou");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirVistoriaSaida(distratoId: string) {
  await prisma.vistoriaSaida.delete({ where: { distratoId } });
  await logAuditoria(distratoId, SECAO.VISTORIA_SAIDA, "Excluiu");
  revalidatePath(`/distrato/${distratoId}`);
}

export async function atualizarVistoriaSaida(
  vistoriaId: string,
  distratoId: string,
  formData: FormData
) {
  const locadorCompareceu = formData.get("locadorCompareceu") === "on";
  const locatarioParticipou = formData.get("locatarioParticipou") === "on";
  const informeDataStr = formData.get("informeData") as string | null;
  const dataEntregaLaudoStr = formData.get("dataEntregaLaudo") as string | null;

  await prisma.vistoriaSaida.update({
    where: { id: vistoriaId },
    data: {
      locadorCompareceu,
      locatarioParticipou,
      informeData: informeDataStr ? new Date(`${informeDataStr}T00:00:00`) : null,
      informeArquivoUrl: (formData.get("informeArquivoUrl") as string) || null,
      informeArquivoNome: (formData.get("informeArquivoNome") as string) || null,
      informeArquivoTipo: (formData.get("informeArquivoTipo") as string) || null,
      dataEntregaLaudo: dataEntregaLaudoStr
        ? new Date(`${dataEntregaLaudoStr}T00:00:00`)
        : null,
      laudoArquivoUrl: (formData.get("laudoArquivoUrl") as string) || null,
      laudoArquivoNome: (formData.get("laudoArquivoNome") as string) || null,
      laudoArquivoTipo: (formData.get("laudoArquivoTipo") as string) || null,
    },
  });

  await logAuditoria(distratoId, SECAO.VISTORIA_SAIDA, "Editou");
  revalidatePath(`/distrato/${distratoId}`);
}
