"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function criarPrestador(formData: FormData) {
  await prisma.prestador.create({
    data: {
      nome: String(formData.get("nome")),
      especialidade: String(formData.get("especialidade")),
      telefone: String(formData.get("telefone")),
      cpf: (formData.get("cpf") as string) || null,
      email: (formData.get("email") as string) || null,
      observacoes: (formData.get("observacoes") as string) || null,
    },
  });

  revalidatePath("/prestadores");
  redirect("/prestadores");
}

export async function atualizarPrestador(id: string, formData: FormData) {
  await prisma.prestador.update({
    where: { id },
    data: {
      nome: String(formData.get("nome")),
      especialidade: String(formData.get("especialidade")),
      telefone: String(formData.get("telefone")),
      cpf: (formData.get("cpf") as string) || null,
      email: (formData.get("email") as string) || null,
      observacoes: (formData.get("observacoes") as string) || null,
    },
  });

  revalidatePath("/prestadores");
  redirect("/prestadores");
}

export async function excluirPrestador(id: string) {
  await prisma.prestador.delete({ where: { id } });
  revalidatePath("/prestadores");
}
