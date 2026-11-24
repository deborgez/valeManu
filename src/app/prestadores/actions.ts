"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { especialidadeCanonica } from "@/lib/especialidades";
import { registrarAuditoria } from "@/lib/auditoria";

export async function criarPrestador(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const novo = await prisma.prestador.create({
    data: {
      nome: String(formData.get("nome")),
      empresa: (formData.get("empresa") as string) || null,
      especialidade: especialidadeCanonica(String(formData.get("especialidade"))),
      telefone: String(formData.get("telefone")),
      cpf: (formData.get("cpf") as string) || null,
      email: (formData.get("email") as string) || null,
      observacoes: (formData.get("observacoes") as string) || null,
    },
  });

  await registrarAuditoria({
    entidade: "PRESTADOR",
    entidadeId: novo.id,
    referencia: novo.nome,
    acao: "Criou",
    detalhe: `Especialidade: ${novo.especialidade}`,
  });

  revalidatePath("/prestadores");
  redirect("/prestadores");
}

export async function atualizarPrestador(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const atualizado = await prisma.prestador.update({
    where: { id },
    data: {
      nome: String(formData.get("nome")),
      empresa: (formData.get("empresa") as string) || null,
      especialidade: especialidadeCanonica(String(formData.get("especialidade"))),
      telefone: String(formData.get("telefone")),
      cpf: (formData.get("cpf") as string) || null,
      email: (formData.get("email") as string) || null,
      observacoes: (formData.get("observacoes") as string) || null,
    },
  });

  await registrarAuditoria({
    entidade: "PRESTADOR",
    entidadeId: id,
    referencia: atualizado.nome,
    acao: "Editou",
    detalhe: "Dados do prestador alterados",
  });

  revalidatePath("/prestadores");
  redirect("/prestadores");
}

export async function excluirPrestador(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const removido = await prisma.prestador.delete({ where: { id } });
  await registrarAuditoria({
    entidade: "PRESTADOR",
    entidadeId: id,
    referencia: removido.nome,
    acao: "Excluiu",
    detalhe: `Especialidade: ${removido.especialidade}`,
  });
  revalidatePath("/prestadores");
}
