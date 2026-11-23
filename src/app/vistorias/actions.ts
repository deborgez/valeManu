"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { formatData, hojeSaoPaulo, parseDataLocal } from "@/lib/datahora";
import { podeEntregarVistoria, podeSolicitarVistoria } from "@/lib/perfis";

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
  if (tipo !== "ENTRADA" && tipo !== "SAIDA") throw new Error("Tipo de vistoria inválido.");

  const processoId = String(formData.get("processoId") || "");
  const comprovanteUrl = String(formData.get("comprovanteUrl") || "");
  if (!processoId) throw new Error("Selecione o processo.");
  if (!comprovanteUrl) throw new Error("Anexe o comprovante do pagamento do sinal.");

  await prisma.processo.findUniqueOrThrow({ where: { id: processoId }, select: { id: true } });

  await prisma.vistoria.create({
    data: {
      tipo,
      processoId,
      comprovanteUrl,
      comprovanteNome: (formData.get("comprovanteNome") as string) || null,
      comprovanteTipo: (formData.get("comprovanteTipo") as string) || null,
      solicitadoPorId: session.user.id,
    },
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

  const vistoria = await prisma.vistoria.findUniqueOrThrow({ where: { id: vistoriaId } });
  if (vistoria.status === "ENTREGUE") return;

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
      entreguePorId: session.user.id,
    },
  });

  revalidarVistorias();
}
