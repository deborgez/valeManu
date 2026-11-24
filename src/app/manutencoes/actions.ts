"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { notificar } from "@/lib/notificacoes";

export async function criarManutencao(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const manutencao = await prisma.manutencao.create({
    data: {
      numeroProcesso: String(formData.get("numeroProcesso")),
      cep: (formData.get("cep") as string) || null,
      rua: String(formData.get("rua")),
      numero: (formData.get("numero") as string) || null,
      complemento: (formData.get("complemento") as string) || null,
      bairro: String(formData.get("bairro")),
      cidade: String(formData.get("cidade")),
      estado: String(formData.get("estado")),
      solicitanteTipo: formData.get("solicitanteTipo") as "LOCADOR" | "LOCATARIO",
      solicitanteNome: (formData.get("solicitanteNome") as string) || null,
      solicitanteCpf: (formData.get("solicitanteCpf") as string) || null,
      natureza: String(formData.get("natureza")),
      descricaoProblema: String(formData.get("descricaoProblema")),
      emergencial: formData.get("emergencial") === "on",
      competencia: formData.get("competencia") as "LOCADOR" | "LOCATARIO",
      status: "SOLICITACAO",
      criadoPorId: session.user.id,
    },
  });

  await prisma.historicoEtapa.create({
    data: { manutencaoId: manutencao.id, etapa: "Solicitação criada" },
  });
  await notificar({
    categoria: "MANUTENCAO",
    perfis: ["ADMIN", "ADMINISTRATIVO"],
    excetoUsuarioId: session.user.id,
    mensagem: `Manutenção ${manutencao.numeroProcesso}: solicitação criada por ${session.user.name ?? "um usuário"}`,
    link: `/manutencoes/${manutencao.id}`,
  });

  redirect(`/manutencoes/${manutencao.id}`);
}

export async function atualizarEndereco(manutencaoId: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  await prisma.manutencao.update({
    where: { id: manutencaoId },
    data: {
      cep: (formData.get("cep") as string) || null,
      rua: String(formData.get("rua")),
      numero: (formData.get("numero") as string) || null,
      complemento: (formData.get("complemento") as string) || null,
      bairro: String(formData.get("bairro")),
      cidade: String(formData.get("cidade")),
      estado: String(formData.get("estado")),
    },
  });

  revalidatePath(`/manutencoes/${manutencaoId}`);
  revalidatePath("/manutencoes");
  revalidatePath("/");
}

export async function atualizarDadosSolicitante(
  manutencaoId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  await prisma.manutencao.update({
    where: { id: manutencaoId },
    data: {
      solicitanteTipo: formData.get("solicitanteTipo") as "LOCADOR" | "LOCATARIO" | "IMOBILIARIA",
      solicitanteNome: (formData.get("solicitanteNome") as string) || null,
      solicitanteCpf: (formData.get("solicitanteCpf") as string) || null,
      competencia: formData.get("competencia") as "LOCADOR" | "LOCATARIO" | "IMOBILIARIA",
      natureza: String(formData.get("natureza")),
    },
  });

  revalidatePath(`/manutencoes/${manutencaoId}`);
  revalidatePath("/manutencoes");
  revalidatePath("/");
}

export async function cancelarManutencao(manutencaoId: string, motivo: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");
  const motivoLimpo = (motivo ?? "").trim();
  if (!motivoLimpo) throw new Error("Informe o motivo do cancelamento.");

  const manutencao = await prisma.manutencao.findUniqueOrThrow({
    where: { id: manutencaoId },
    include: { pagamentos: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (manutencao.status === "CANCELADA") return;
  if (manutencao.status === "CONCLUIDA" && manutencao.pagamentos[0]?.status === "PAGO") {
    throw new Error("Uma manutenção com pagamento efetuado não pode ser cancelada.");
  }

  await prisma.$transaction([
    prisma.manutencao.update({
      where: { id: manutencaoId },
      data: {
        statusAntesCancelamento: manutencao.status,
        status: "CANCELADA",
        canceladaEm: new Date(),
      },
    }),
    prisma.historicoEtapa.create({
      data: {
        manutencaoId,
        etapa: "Manutenção cancelada",
        detalhe: `Motivo: ${motivoLimpo} (cancelada por ${session.user.name ?? "um usuário"})`,
      },
    }),
  ]);

  await notificar({
    categoria: "MANUTENCAO",
    perfis: ["ADMIN", "ADMINISTRATIVO"],
    excetoUsuarioId: session.user.id,
    mensagem: `Manutenção ${manutencao.numeroProcesso}: cancelada por ${session.user.name ?? "um usuário"} — ${motivoLimpo}`,
    link: `/manutencoes/${manutencaoId}`,
  });

  revalidatePath(`/manutencoes/${manutencaoId}`);
  revalidatePath("/manutencoes");
  revalidatePath("/");
}

export async function reabrirManutencaoCancelada(manutencaoId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const manutencao = await prisma.manutencao.findUniqueOrThrow({ where: { id: manutencaoId } });
  if (manutencao.status !== "CANCELADA") return;

  const retornaPara = manutencao.statusAntesCancelamento ?? "SOLICITACAO";
  const diasCancelada = manutencao.canceladaEm
    ? Math.floor((Date.now() - manutencao.canceladaEm.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  await prisma.$transaction([
    prisma.manutencao.update({
      where: { id: manutencaoId },
      data: {
        status: retornaPara,
        statusAntesCancelamento: null,
        canceladaEm: null,
        diasPausados: { increment: diasCancelada },
      },
    }),
    prisma.historicoEtapa.create({
      data: {
        manutencaoId,
        etapa: "Manutenção reaberta após cancelamento",
        detalhe: `Reaberta por ${session.user.name ?? "um usuário"} — voltou para a etapa em que estava`,
      },
    }),
  ]);

  await notificar({
    categoria: "MANUTENCAO",
    perfis: ["ADMIN", "ADMINISTRATIVO"],
    excetoUsuarioId: session.user.id,
    mensagem: `Manutenção ${manutencao.numeroProcesso}: reaberta após cancelamento por ${session.user.name ?? "um usuário"}`,
    link: `/manutencoes/${manutencaoId}`,
  });

  revalidatePath(`/manutencoes/${manutencaoId}`);
  revalidatePath("/manutencoes");
  revalidatePath("/");
}
