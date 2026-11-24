"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { formatData, hojeSaoPaulo, parseDataLocal } from "@/lib/datahora";
import { podeEntregarVistoria, podeSolicitarVistoria } from "@/lib/perfis";
import { notificar } from "@/lib/notificacoes";
import { lerAgendamento } from "@/lib/vistorias";
import { registrarAuditoria } from "@/lib/auditoria";

function revalidarVistorias() {
  revalidatePath("/vistorias/entrada");
  revalidatePath("/vistorias/saida");
  revalidatePath("/vistorias/solicitacoes");
  revalidatePath("/vistorias/relatorios");
}

export async function solicitarVistoria(tipo: "ENTRADA" | "SAIDA", formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");
  if (!podeSolicitarVistoria(session.user.role)) {
    throw new Error("Seu perfil não pode solicitar vistorias.");
  }
  if (tipo !== "ENTRADA") {
    throw new Error("A vistoria de saída é solicitada pelo Distrato, na aba Relacionamento.");
  }

  const processoId = String(formData.get("processoId") || "");
  const comprovanteUrl = String(formData.get("comprovanteUrl") || "");
  if (!processoId) throw new Error("Selecione o processo.");
  if (!comprovanteUrl) throw new Error("Anexe o comprovante do pagamento do sinal.");

  const agendamento = lerAgendamento(formData);

  const processo = await prisma.processo.findUniqueOrThrow({
    where: { id: processoId },
    select: { id: true, numeroProcesso: true },
  });

  const criada = await prisma.vistoria.create({
    data: {
      tipo,
      processoId,
      comprovanteUrl,
      comprovanteNome: (formData.get("comprovanteNome") as string) || null,
      comprovanteTipo: (formData.get("comprovanteTipo") as string) || null,
      ...agendamento,
      solicitadoPorId: session.user.id,
    },
  });

  await registrarAuditoria({
    entidade: "VISTORIA",
    entidadeId: criada.id,
    referencia: processo.numeroProcesso,
    acao: "Solicitou",
    detalhe: "Vistoria de entrada solicitada",
  });

  await notificar({
    categoria: "VISTORIA",
    perfis: ["ADMIN", "VISTORIADOR"],
    excetoUsuarioId: session.user.id,
    mensagem: `Nova vistoria de entrada ${agendamento.agendadaPara ? `agendada para ${formatData(agendamento.agendadaPara)}` : "solicitada"} — processo ${processo.numeroProcesso}`,
    link: "/vistorias/solicitacoes",
  });

  revalidarVistorias();
}

export async function concluirVistoria(vistoriaId: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");
  if (!podeEntregarVistoria(session.user.role)) {
    throw new Error("Apenas o vistoriador ou o administrador podem concluir vistorias.");
  }

  const dataStr = String(formData.get("data") || "");
  const hora = String(formData.get("hora") || "");
  if (!dataStr || !hora) throw new Error("Informe a data e o horário da entrega.");
  if (dataStr > hojeSaoPaulo()) throw new Error("A data de entrega não pode ser no futuro.");

  const vistoria = await prisma.vistoria.findUniqueOrThrow({
    where: { id: vistoriaId },
    include: { processo: { select: { numeroProcesso: true } } },
  });
  if (vistoria.status === "ENTREGUE") return;
  const participouLocador = formData.get("locadorParticipou") === "on";
  const participouLocatario = formData.get("locatarioParticipou") === "on";

  const entregueData = parseDataLocal(dataStr);
  const solicitadaEm = parseDataLocal(
    vistoria.createdAt.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" })
  );
  if (entregueData < solicitadaEm) {
    throw new Error(`A data de entrega não pode ser anterior à solicitação (${formatData(solicitadaEm)}).`);
  }

  await prisma.vistoria.update({
    where: { id: vistoriaId },
    data: {
      status: "ENTREGUE",
      entregueData,
      entregueHora: hora,
      descricaoConclusao: String(formData.get("descricao") || "").trim() || null,
      entreguePorId: session.user.id,
      ...(vistoria.tipo === "SAIDA"
        ? { locadorParticipou: participouLocador, locatarioParticipou: participouLocatario }
        : {}),
    },
  });

  const tipoTexto = vistoria.tipo === "SAIDA" ? "saída" : "entrada";
  const numero = vistoria.processo.numeroProcesso;

  await registrarAuditoria({
    entidade: "VISTORIA",
    entidadeId: vistoriaId,
    referencia: numero,
    acao: "Concluiu",
    detalhe: `Vistoria de ${tipoTexto} concluída em ${formatData(entregueData)} às ${hora}`,
  });

  if (vistoria.distratoId) {
    const partes = [
      participouLocador && "locador participou",
      participouLocatario && "locatário participou",
    ].filter(Boolean);
    await prisma.distratoAuditoria.create({
      data: {
        distratoId: vistoria.distratoId,
        secao: "SOLICITACAO_VISTORIA_SAIDA",
        acao: "Editou",
        detalhe: `Vistoria de saída concluída em ${formatData(entregueData)} às ${hora}${partes.length ? ` (${partes.join(", ")})` : ""}`,
        usuarioId: session.user.id,
      },
    });
    revalidatePath(`/distrato/${vistoria.distratoId}`);
  }

  await notificar({
    categoria: "VISTORIA",
    perfis: vistoria.distratoId ? ["ADMIN", "ADMINISTRATIVO"] : ["ADMIN"],
    usuarios: [vistoria.solicitadoPorId],
    excetoUsuarioId: session.user.id,
    mensagem: `Vistoria de ${tipoTexto} concluída — processo ${numero}${vistoria.distratoId ? ": os comunicados de encerramento já podem ser registrados" : ""}`,
    link: vistoria.distratoId ? `/distrato/${vistoria.distratoId}` : `/vistorias/${vistoria.tipo === "SAIDA" ? "saida" : "entrada"}`,
  });

  revalidarVistorias();
}
