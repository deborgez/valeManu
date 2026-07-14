"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
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

  await prisma.user.create({
    data: {
      nome: String(formData.get("nome")),
      email: String(formData.get("email")),
      senhaHash,
      role: formData.get("role") === "ADMIN" ? "ADMIN" : "USER",
    },
  });

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function excluirUsuario(id: string) {
  await garantirAdmin();
  await prisma.user.delete({ where: { id } });
  revalidatePath("/usuarios");
}

export async function atualizarUsuario(id: string, formData: FormData) {
  await garantirAdmin();

  const senha = (formData.get("senha") as string) || "";

  await prisma.user.update({
    where: { id },
    data: {
      nome: String(formData.get("nome")),
      email: String(formData.get("email")),
      role: formData.get("role") === "ADMIN" ? "ADMIN" : "USER",
      ...(senha ? { senhaHash: await bcrypt.hash(senha, 10) } : {}),
    },
  });

  revalidatePath("/usuarios");
  redirect("/usuarios");
}
