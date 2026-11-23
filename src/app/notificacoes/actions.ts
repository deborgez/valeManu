"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
}
