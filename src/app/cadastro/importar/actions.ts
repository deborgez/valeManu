"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseDataLocal } from "@/lib/datahora";
import { lerPlanilha, parseDataBr, parseNumeroBr, chaveColuna } from "@/lib/planilha";
import { especialidadeCanonica } from "@/lib/especialidades";

async function garantirGestao() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMINISTRATIVO")) {
    throw new Error("Sem permissão para importar.");
  }
  return session;
}

function resumo(tipo: string, criados: number, ignorados: number, erros: string[]) {
  const params = new URLSearchParams({
    tipo,
    criados: String(criados),
    ignorados: String(ignorados),
    erros: erros.slice(0, 8).join(" | "),
  });
  redirect(`/cadastro/importar?${params.toString()}`);
}

export async function importarPrestadores(formData: FormData) {
  await garantirGestao();
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) resumo("prestadores", 0, 0, ["Nenhum arquivo enviado."]);

  const linhas = await lerPlanilha(arquivo as File);
  const existentes = await prisma.prestador.findMany({ select: { nome: true, telefone: true } });
  const jaTem = new Set(existentes.map((p) => `${chaveColuna(p.nome)}|${p.telefone.replace(/\D/g, "")}`));

  let criados = 0;
  let ignorados = 0;
  const erros: string[] = [];

  for (const [i, l] of linhas.entries()) {
    const nome = l.nome;
    const especialidade = l.especialidade;
    const telefone = l.telefone;
    if (!nome || !especialidade || !telefone) {
      erros.push(`Linha ${i + 2}: nome, especialidade e telefone são obrigatórios`);
      continue;
    }
    const chave = `${chaveColuna(nome)}|${telefone.replace(/\D/g, "")}`;
    if (jaTem.has(chave)) {
      ignorados++;
      continue;
    }
    await prisma.prestador.create({
      data: {
        nome,
        empresa: l.empresa || null,
        especialidade: especialidadeCanonica(especialidade),
        telefone,
        cpf: l.cpfcnpj || l.cpf || null,
        email: l.email || null,
        observacoes: l.observacoes || null,
      },
    });
    jaTem.add(chave);
    criados++;
  }

  revalidatePath("/prestadores");
  resumo("prestadores", criados, ignorados, erros);
}

const GARANTIAS: [string, "FIADOR" | "SEGURO_FIANCA" | "FIANCA_ONEROSA" | "TITULO_CAPITALIZACAO" | "CAUCAO_IMOBILIARIA" | "CAUCAO_DINHEIRO" | "SEM_GARANTIA"][] = [
  ["fiador", "FIADOR"],
  ["segurofianca", "SEGURO_FIANCA"],
  ["fiancaonerosa", "FIANCA_ONEROSA"],
  ["titulo", "TITULO_CAPITALIZACAO"],
  ["caucaoimob", "CAUCAO_IMOBILIARIA"],
  ["caucaodinheiro", "CAUCAO_DINHEIRO"],
  ["semgarantia", "SEM_GARANTIA"],
];

export async function importarProcessos(formData: FormData) {
  const session = await garantirGestao();
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) resumo("processos", 0, 0, ["Nenhum arquivo enviado."]);

  const linhas = await lerPlanilha(arquivo as File);
  const existentes = new Set(
    (await prisma.processo.findMany({ select: { numeroProcesso: true } })).map((p) => p.numeroProcesso)
  );

  let criados = 0;
  let ignorados = 0;
  const erros: string[] = [];

  for (const [i, l] of linhas.entries()) {
    const numero = l.processo;
    if (!numero) {
      erros.push(`Linha ${i + 2}: número do processo em branco`);
      continue;
    }
    if (existentes.has(numero)) {
      ignorados++;
      continue;
    }

    const inicioStr = parseDataBr(l.iniciodocontrato ?? "");
    const meses = parseNumeroBr(l.prazodocontratomeses ?? "");
    const inicio = inicioStr ? parseDataLocal(inicioStr) : null;
    let fim: Date | null = null;
    if (inicio && meses) {
      fim = new Date(inicio);
      fim.setMonth(fim.getMonth() + meses);
      fim.setDate(fim.getDate() - 1);
    }
    const garantiaChave = chaveColuna(l.garantia ?? "");
    const tipoFianca = GARANTIAS.find(([k]) => garantiaChave.includes(k))?.[1] ?? null;

    const partes: { tipo: "LOCADOR" | "LOCATARIO"; nome: string; telefone: string; cpf: string }[] = [];
    if (l.locatario) {
      partes.push({
        tipo: "LOCATARIO",
        nome: l.locatario,
        telefone: l.telefonedolocatario ?? "",
        cpf: l.cpfdolocatario ?? "",
      });
    }
    if (l.locador) {
      partes.push({
        tipo: "LOCADOR",
        nome: l.locador,
        telefone: l.telefonedolocador ?? "",
        cpf: l.cpfdolocador ?? "",
      });
    }

    try {
      await prisma.processo.create({
        data: {
          numeroProcesso: numero,
          unidade: l.unidade || null,
          captador: l.captador || null,
          codigoImovel: l.codigodoimovel || null,
          prazoContratoInicio: inicio,
          prazoContratoMeses: meses ? Math.round(meses) : null,
          prazoContratoFim: fim,
          prazoMultaMeses: (() => {
            const m = parseNumeroBr(l.prazodamultameses ?? "");
            return m ? Math.round(m) : null;
          })(),
          valorAluguel: parseNumeroBr(l.valordoaluguel ?? ""),
          cep: l.cep || null,
          rua: l.rua || null,
          numero: l.numero || null,
          complemento: l.complemento || null,
          bairro: l.bairro || null,
          cidade: l.cidade || null,
          estado: l.estado || null,
          tipoFianca,
          fiancaNome: l.nomedagarantia || null,
          criadoPorId: session.user.id,
          partes: { create: partes },
        },
      });
      existentes.add(numero);
      criados++;
    } catch {
      erros.push(`Linha ${i + 2}: não foi possível cadastrar o processo ${numero}`);
    }
  }

  revalidatePath("/cadastro");
  resumo("processos", criados, ignorados, erros);
}
