"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function criarProcesso(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const tipoFiancaBruto = formData.get("tipoFianca") as string | null;
  const tipoFianca =
    tipoFiancaBruto === "FIADOR" ||
    tipoFiancaBruto === "SEGURO_FIANCA" ||
    tipoFiancaBruto === "FIANCA_ONEROSA"
      ? tipoFiancaBruto
      : null;

  const partesTipo = formData.getAll("parteTipo") as string[];
  const partesNome = formData.getAll("parteNome") as string[];
  const partesTelefone = formData.getAll("parteTelefone") as string[];

  const processo = await prisma.processo.create({
    data: {
      numeroProcesso: String(formData.get("numeroProcesso")),
      tipoFianca,
      fiancaNome: (formData.get("fiancaNome") as string) || null,
      fiancaTelefone: (formData.get("fiancaTelefone") as string) || null,
      cep: (formData.get("cep") as string) || null,
      rua: (formData.get("rua") as string) || null,
      numero: (formData.get("numero") as string) || null,
      complemento: (formData.get("complemento") as string) || null,
      bairro: (formData.get("bairro") as string) || null,
      cidade: (formData.get("cidade") as string) || null,
      estado: (formData.get("estado") as string) || null,
      criadoPorId: session.user.id,
      partes: {
        create: partesTipo.map((tipo, i) => ({
          tipo: tipo as "LOCADOR" | "LOCATARIO" | "IMOBILIARIA",
          nome: partesNome[i],
          telefone: partesTelefone[i],
        })),
      },
    },
  });

  redirect(`/cadastro/${processo.id}`);
}
