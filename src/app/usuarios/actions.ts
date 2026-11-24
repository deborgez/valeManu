"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { perfilValido, LABEL_PERFIL } from "@/lib/perfis";
import { registrarAuditoria } from "@/lib/auditoria";
import { redirect } from "next/navigation";

async function garantirAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Apenas administradores podem gerenciar usuários.");
  }
}

export async function criarUsuario(formData: FormData) {
  await garantirAdmin();

  const senha = String(formData.get("senha"));
  const senhaHash = await bcrypt.hash(senha, 10);

  const novo = await prisma.user.create({
    data: {
      nome: String(formData.get("nome")),
      email: String(formData.get("email")),
      senhaHash,
      role: perfilValido(formData.get("role")),
      unidade: (formData.get("unidade") as string) || null,
    },
  });

  await registrarAuditoria({
    entidade: "USUARIO",
    entidadeId: novo.id,
    referencia: novo.nome,
    acao: "Criou",
    detalhe: `Perfil: ${LABEL_PERFIL[novo.role]}`,
  });

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function excluirUsuario(id: string) {
  await garantirAdmin();
  const removido = await prisma.user.delete({ where: { id } });
  await registrarAuditoria({
    entidade: "USUARIO",
    entidadeId: id,
    referencia: removido.nome,
    acao: "Excluiu",
    detalhe: `Perfil: ${LABEL_PERFIL[removido.role]}`,
  });
  revalidatePath("/usuarios");
}

export async function atualizarUsuario(id: string, formData: FormData) {
  await garantirAdmin();

  const senha = (formData.get("senha") as string) || "";

  const antes = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  const atualizado = await prisma.user.update({
    where: { id },
    data: {
      nome: String(formData.get("nome")),
      email: String(formData.get("email")),
      role: perfilValido(formData.get("role")),
      unidade: (formData.get("unidade") as string) || null,
      ...(senha ? { senhaHash: await bcrypt.hash(senha, 10) } : {}),
    },
  });

  const partes = [
    antes && antes.role !== atualizado.role
      ? `Perfil: ${LABEL_PERFIL[antes.role]} para ${LABEL_PERFIL[atualizado.role]}`
      : null,
    senha ? "Senha redefinida" : null,
  ].filter(Boolean);
  await registrarAuditoria({
    entidade: "USUARIO",
    entidadeId: id,
    referencia: atualizado.nome,
    acao: "Editou",
    detalhe: partes.length ? partes.join("; ") : "Dados do usuário alterados",
  });

  revalidatePath("/usuarios");
  redirect("/usuarios");
}
