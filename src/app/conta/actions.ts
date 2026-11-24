"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function alterarSenha(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const atual = String(formData.get("senhaAtual") ?? "");
  const nova = String(formData.get("novaSenha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  if (nova.length < 8) redirect("/conta?erro=curta");
  if (nova !== confirmacao) redirect("/conta?erro=diferente");

  const usuario = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!usuario || !(await bcrypt.compare(atual, usuario.senhaHash))) {
    redirect("/conta?erro=atual");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { senhaHash: await bcrypt.hash(nova, 10) },
  });

  redirect("/conta?ok=1");
}
