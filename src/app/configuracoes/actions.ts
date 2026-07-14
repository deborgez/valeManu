"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function atualizarImobiliaria(formData: FormData) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Apenas administradores podem alterar as configurações.");
  }

  const logoUrl = (formData.get("logoUrl") as string) || undefined;

  await prisma.imobiliaria.upsert({
    where: { id: "singleton" },
    update: {
      nome: String(formData.get("nome")),
      endereco: String(formData.get("endereco")),
      telefone: String(formData.get("telefone")),
      email: String(formData.get("email")),
      ...(logoUrl ? { logoUrl } : {}),
    },
    create: {
      id: "singleton",
      nome: String(formData.get("nome")),
      endereco: String(formData.get("endereco")),
      telefone: String(formData.get("telefone")),
      email: String(formData.get("email")),
      logoUrl,
    },
  });

  revalidatePath("/configuracoes");
}
