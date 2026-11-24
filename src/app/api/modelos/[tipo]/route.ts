import { auth } from "@/lib/auth";

const MODELOS: Record<string, string[][]> = {
  prestadores: [
    ["Nome", "Empresa", "Especialidade", "Telefone", "CPF/CNPJ", "E-mail", "Observações"],
    ["João da Silva", "Silva Hidráulica", "Hidráulica", "(16) 99999-0000", "", "joao@email.com", ""],
  ],
  processos: [
    [
      "Processo", "Unidade", "Captador", "Código do imóvel", "Início do contrato", "Prazo do contrato (meses)",
      "Prazo da multa (meses)", "Valor do aluguel", "CEP", "Rua", "Número", "Complemento", "Bairro", "Cidade",
      "Estado", "Locatário", "Telefone do locatário", "CPF do locatário", "Locador", "Telefone do locador",
      "CPF do locador", "Garantia", "Nome da garantia",
    ],
    [
      "IMB.LC.1.26.01.00001", "Monte Real", "Maria Souza", "1234", "10/01/2026", "36", "3", "1.500,00",
      "15900-000", "Rua Exemplo", "100", "", "Centro", "Taquaritinga", "SP", "Carlos Locatário",
      "(16) 99999-0001", "000.000.000-00", "Ana Locadora", "(16) 99999-0002", "000.000.000-01",
      "Fiador", "Nome do fiador",
    ],
  ],
};

export async function GET(_request: Request, { params }: { params: Promise<{ tipo: string }> }) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMINISTRATIVO")) {
    return new Response("Sem permissão.", { status: 403 });
  }
  const { tipo } = await params;
  const linhas = MODELOS[tipo];
  if (!linhas) return new Response("Modelo inexistente.", { status: 404 });

  const csv = linhas
    .map((l) => l.map((c) => (/[;"]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(";"))
    .join("\r\n");

  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="modelo-${tipo}.csv"`,
    },
  });
}
