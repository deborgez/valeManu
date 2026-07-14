"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
