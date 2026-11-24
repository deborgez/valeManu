"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const CATEGORIAS = ["DISTRATO", "MANUTENCAO", "VISTORIA"];

export async function marcarNotificacaoLida(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");
  await prisma.notificacao.updateMany({
    where: { id, usuarioId: session.user.id },
    data: { lida: true },
  });
}

export async function marcarTodasNotificacoesLidas() {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");
  await prisma.notificacao.updateMany({
    where: { usuarioId: session.user.id, lida: false },
    data: { lida: true },
  });
  revalidatePath("/notificacoes");
}

export async function salvarPreferenciasNotificacao(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const ativas = new Set(formData.getAll("categoria").map(String));
  const desativadas = CATEGORIAS.filter((c) => !ativas.has(c));

  await prisma.user.update({
    where: { id: session.user.id },
    data: { notificacoesDesativadas: desativadas },
  });
  revalidatePath("/notificacoes");
}
