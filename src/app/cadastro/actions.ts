"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function criarProcesso(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const tipoFianca = formData.get("tipoFianca") as
    | "FIADOR"
    | "SEGURO_FIANCA"
    | "FIANCA_ONEROSA";

  const processo = await prisma.processo.create({
    data: {
      numeroProcesso: String(formData.get("numeroProcesso")),
      locadorNome: String(formData.get("locadorNome")),
      locadorTelefone: String(formData.get("locadorTelefone")),
      locatarioNome: String(formData.get("locatarioNome")),
      locatarioTelefone: String(formData.get("locatarioTelefone")),
      tipoFianca,
      fiancaNome: String(formData.get("fiancaNome")),
      fiancaTelefone: (formData.get("fiancaTelefone") as string) || null,
      cep: (formData.get("cep") as string) || null,
      rua: String(formData.get("rua")),
      numero: (formData.get("numero") as string) || null,
      complemento: (formData.get("complemento") as string) || null,
      bairro: String(formData.get("bairro")),
      cidade: String(formData.get("cidade")),
      estado: String(formData.get("estado")),
      criadoPorId: session.user.id,
    },
  });

  redirect(`/cadastro/${processo.id}`);
}
