import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEndereco } from "@/lib/endereco";
import { formatData, hojeSaoPaulo } from "@/lib/datahora";
import { LABEL_MANUTENCAO_STATUS, LABEL_TIPO_FIANCA } from "@/lib/labels";
import { LABEL_TIPO_VISTORIA, prazoVistoria } from "@/lib/vistorias";

type Linha = (string | number | null | undefined)[];

function celula(valor: string | number | null | undefined): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return /[;"\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function csv(cabecalho: string[], linhas: Linha[]): string {
  return [cabecalho, ...linhas].map((l) => l.map(celula).join(";")).join("\r\n");
}

const GESTAO = ["ADMIN", "ADMINISTRATIVO"];

const PERMISSOES: Record<string, string[]> = {
  processos: ["ADMIN", "ADMINISTRATIVO", "CORRETOR"],
  prestadores: GESTAO,
  manutencoes: GESTAO,
  distratos: GESTAO,
  vistorias: ["ADMIN", "ADMINISTRATIVO", "CORRETOR", "VISTORIADOR"],
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tipo: string }> }
) {
  const session = await auth();
  if (!session) return new Response("Não autenticado.", { status: 401 });

  const { tipo } = await params;
  const permitidos = PERMISSOES[tipo];
  if (!permitidos) return new Response("Relatório inexistente.", { status: 404 });
  if (!permitidos.includes(session.user.role)) {
    return new Response("Sem permissão.", { status: 403 });
  }

  let conteudo = "";

  if (tipo === "processos") {
    const processos = await prisma.processo.findMany({
      include: { partes: true },
      orderBy: { numeroProcesso: "asc" },
    });
    conteudo = csv(
      ["Processo", "Unidade", "Código do imóvel", "Endereço", "Locadores", "Locatários", "Garantia", "Início do contrato", "Prazo (meses)", "Valor do aluguel"],
      processos.map((p) => [
        p.numeroProcesso,
        p.unidade,
        p.codigoImovel,
        formatEndereco(p),
        p.partes.filter((x) => x.tipo === "LOCADOR").map((x) => x.nome).join(", "),
        p.partes.filter((x) => x.tipo === "LOCATARIO").map((x) => x.nome).join(", "),
        p.tipoFianca ? LABEL_TIPO_FIANCA[p.tipoFianca] : "",
        p.prazoContratoInicio ? formatData(p.prazoContratoInicio) : "",
        p.prazoContratoMeses,
        p.valorAluguel !== null ? p.valorAluguel.toFixed(2).replace(".", ",") : "",
      ])
    );
  } else if (tipo === "prestadores") {
    const prestadores = await prisma.prestador.findMany({ orderBy: { nome: "asc" } });
    conteudo = csv(
      ["Nome", "Empresa", "Especialidade", "Telefone", "CPF/CNPJ", "E-mail", "Observações"],
      prestadores.map((p) => [p.nome, p.empresa, p.especialidade, p.telefone, p.cpf, p.email, p.observacoes])
    );
  } else if (tipo === "manutencoes") {
    const manutencoes = await prisma.manutencao.findMany({
      include: { criadoPor: { select: { nome: true } } },
      orderBy: { createdAt: "desc" },
    });
    conteudo = csv(
      ["Processo", "Endereço", "Natureza", "Situação", "Emergencial", "Criada em", "Criada por"],
      manutencoes.map((m) => [
        m.numeroProcesso,
        formatEndereco(m),
        m.natureza,
        LABEL_MANUTENCAO_STATUS[m.status] ?? m.status,
        m.emergencial ? "Sim" : "Não",
        formatData(m.createdAt),
        m.criadoPor.nome,
      ])
    );
  } else if (tipo === "distratos") {
    const distratos = await prisma.distrato.findMany({
      include: {
        processo: { select: { numeroProcesso: true } },
        criadoPor: { select: { nome: true } },
        avisoPrevio: { select: { data: true } },
        entregaChaves: { select: { data: true } },
        solicitacaoVistoria: { select: { status: true, entregueData: true } },
        comunicadoEncerramentoLocador: { select: { id: true } },
        comunicadoEncerramentoLocatario: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    conteudo = csv(
      ["Processo", "Iniciado em", "Criado por", "Aviso prévio", "Entrega das chaves", "Vistoria concluída em", "Relacionamento concluído"],
      distratos.map((d) => [
        d.processo.numeroProcesso,
        formatData(d.createdAt),
        d.criadoPor.nome,
        d.avisoPrevio ? formatData(d.avisoPrevio.data) : "",
        d.entregaChaves ? formatData(d.entregaChaves.data) : "",
        d.solicitacaoVistoria?.entregueData ? formatData(d.solicitacaoVistoria.entregueData) : "",
        d.comunicadoEncerramentoLocador && d.comunicadoEncerramentoLocatario ? "Sim" : "Não",
      ])
    );
  } else if (tipo === "vistorias") {
    const vistorias = await prisma.vistoria.findMany({
      include: {
        processo: true,
        solicitadoPor: { select: { nome: true } },
        entreguePor: { select: { nome: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    conteudo = csv(
      ["Tipo", "Processo", "Endereço", "Valor do aluguel", "Solicitada em", "Prazo", "Situação", "Entregue em", "Horário", "Entregue por", "Solicitada por"],
      vistorias.map((v) => [
        LABEL_TIPO_VISTORIA[v.tipo],
        v.processo.numeroProcesso,
        formatEndereco(v.processo),
        v.processo.valorAluguel !== null ? v.processo.valorAluguel.toFixed(2).replace(".", ",") : "",
        formatData(v.createdAt),
        formatData(prazoVistoria(v)),
        v.status === "ENTREGUE" ? "Entregue" : "Pendente",
        v.entregueData ? formatData(v.entregueData) : "",
        v.entregueHora,
        v.entreguePor?.nome,
        v.solicitadoPor.nome,
      ])
    );
  }

  return new Response("﻿" + conteudo, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${tipo}-${hojeSaoPaulo()}.csv"`,
    },
  });
}
