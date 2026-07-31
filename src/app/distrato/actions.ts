"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { formatData, hojeSaoPaulo } from "@/lib/datahora";
import { LABEL_FORMA_AVISO, LABEL_FORMA_CONTATO } from "@/lib/labels";

const SECAO = {
  AVISO_PREVIO: "AVISO_PREVIO",
  COMUNICADO: "COMUNICADO",
  ACOMPANHAMENTO: "ACOMPANHAMENTO",
  AGENDAMENTO_VISTORIA: "AGENDAMENTO_VISTORIA",
  ENTREGA_CHAVES: "ENTREGA_CHAVES",
  VISTORIA_SAIDA: "VISTORIA_SAIDA",
} as const;

async function logAuditoria(
  distratoId: string,
  secao: string,
  acao: string,
  detalhe?: string
) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  await prisma.distratoAuditoria.create({
    data: {
      distratoId,
      secao,
      acao,
      detalhe: detalhe ?? null,
      usuarioId: session.user.id,
    },
  });
}

function validarNaoFutura(dataStr: string, campo: string) {
  if (dataStr > hojeSaoPaulo()) {
    throw new Error(`A data de ${campo} não pode ser no futuro.`);
  }
}

function formatarValor(v: unknown): string {
  if (v === null || v === undefined || v === "") return "vazio";
  if (v instanceof Date) return formatData(v);
  if (typeof v === "boolean") return v ? "Sim" : "Não";
  return String(v);
}

function saoIguais(a: unknown, b: unknown): boolean {
  if (a instanceof Date || b instanceof Date) {
    return new Date(a as Date).getTime() === new Date(b as Date).getTime();
  }
  return a === b;
}

type CampoConfig = {
  label: string;
  formatar?: (v: unknown) => string;
  arquivo?: boolean;
};

function descreverAlteracoes(
  antigo: Record<string, unknown>,
  novo: Record<string, unknown>,
  campos: Record<string, CampoConfig>
): string | undefined {
  const partes: string[] = [];
  for (const [chave, config] of Object.entries(campos)) {
    const valorAntigo = antigo[chave];
    const valorNovo = novo[chave];

    if (config.arquivo) {
      if (valorAntigo !== valorNovo) partes.push(`Alterou ${config.label}`);
      continue;
    }
    if (saoIguais(valorAntigo, valorNovo)) continue;

    const formatar = config.formatar ?? formatarValor;
    partes.push(
      `Alterou ${config.label} de ${formatar(valorAntigo)} para ${formatar(valorNovo)}`
    );
  }
  return partes.length > 0 ? partes.join("; ") : undefined;
}

export async function criarDistrato(processoId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const distrato = await prisma.distrato.create({
    data: { processoId, criadoPorId: session.user.id },
  });

  redirect(`/distrato/${distrato.id}`);
}

export async function registrarAvisoPrevio(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  validarNaoFutura(dataStr, "Aviso Prévio");
  const data = new Date(`${dataStr}T00:00:00`);
  const forma = formData.get("forma") as "EMAIL" | "WHATSAPP" | "TERMO";

  await prisma.avisoPrevioLocatario.create({
    data: {
      distratoId,
      data,
      forma,
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
    },
  });

  await logAuditoria(
    distratoId,
    SECAO.AVISO_PREVIO,
    "Registrou",
    `Data: ${formatData(data)} — Forma: ${LABEL_FORMA_AVISO[forma]}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarAvisoPrevio(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  validarNaoFutura(dataStr, "Aviso Prévio");
  const data = new Date(`${dataStr}T00:00:00`);
  const forma = formData.get("forma") as "EMAIL" | "WHATSAPP" | "TERMO";
  const arquivoUrl = (formData.get("arquivoUrl") as string) || null;
  const arquivoNome = (formData.get("arquivoNome") as string) || null;
  const arquivoTipo = (formData.get("arquivoTipo") as string) || null;

  const antigo = await prisma.avisoPrevioLocatario.findUniqueOrThrow({
    where: { distratoId },
  });

  await prisma.avisoPrevioLocatario.update({
    where: { distratoId },
    data: { data, forma, arquivoUrl, arquivoNome, arquivoTipo },
  });

  const detalhe = descreverAlteracoes(antigo, { data, forma, arquivoUrl }, {
    data: { label: "a data" },
    forma: { label: "a forma", formatar: (v) => LABEL_FORMA_AVISO[v as string] ?? String(v) },
    arquivoUrl: { label: "o arquivo anexado", arquivo: true },
  });

  await logAuditoria(distratoId, SECAO.AVISO_PREVIO, "Editou", detalhe);
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirAvisoPrevio(distratoId: string) {
  const registro = await prisma.avisoPrevioLocatario.findUniqueOrThrow({
    where: { distratoId },
  });
  await prisma.avisoPrevioLocatario.delete({ where: { distratoId } });
  await logAuditoria(
    distratoId,
    SECAO.AVISO_PREVIO,
    "Excluiu",
    `Data: ${formatData(registro.data)} — Forma: ${LABEL_FORMA_AVISO[registro.forma]}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function registrarComunicado(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  validarNaoFutura(dataStr, "Comunicado");
  const data = new Date(`${dataStr}T00:00:00`);
  const forma = formData.get("forma") as "EMAIL" | "WHATSAPP" | "TERMO";

  const distrato = await prisma.distrato.findUniqueOrThrow({
    where: { id: distratoId },
    include: { avisoPrevio: true },
  });

  if (distrato.avisoPrevio && data < distrato.avisoPrevio.data) {
    redirect(`/distrato/${distratoId}?erroComunicado=1`);
  }

  await prisma.comunicadoLocador.create({
    data: {
      distratoId,
      data,
      forma,
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
    },
  });

  await logAuditoria(
    distratoId,
    SECAO.COMUNICADO,
    "Registrou",
    `Data: ${formatData(data)} — Forma: ${LABEL_FORMA_AVISO[forma]}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarComunicado(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  validarNaoFutura(dataStr, "Comunicado");
  const data = new Date(`${dataStr}T00:00:00`);
  const forma = formData.get("forma") as "EMAIL" | "WHATSAPP" | "TERMO";
  const arquivoUrl = (formData.get("arquivoUrl") as string) || null;
  const arquivoNome = (formData.get("arquivoNome") as string) || null;
  const arquivoTipo = (formData.get("arquivoTipo") as string) || null;

  const distrato = await prisma.distrato.findUniqueOrThrow({
    where: { id: distratoId },
    include: { avisoPrevio: true, comunicadoLocador: true },
  });

  if (distrato.avisoPrevio && data < distrato.avisoPrevio.data) {
    redirect(`/distrato/${distratoId}?erroComunicado=1`);
  }

  await prisma.comunicadoLocador.update({
    where: { distratoId },
    data: { data, forma, arquivoUrl, arquivoNome, arquivoTipo },
  });

  const detalhe = descreverAlteracoes(
    distrato.comunicadoLocador ?? {},
    { data, forma, arquivoUrl },
    {
      data: { label: "a data" },
      forma: { label: "a forma", formatar: (v) => LABEL_FORMA_AVISO[v as string] ?? String(v) },
      arquivoUrl: { label: "o arquivo anexado", arquivo: true },
    }
  );

  await logAuditoria(distratoId, SECAO.COMUNICADO, "Editou", detalhe);
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirComunicado(distratoId: string) {
  const registro = await prisma.comunicadoLocador.findUniqueOrThrow({
    where: { distratoId },
  });
  await prisma.comunicadoLocador.delete({ where: { distratoId } });
  await logAuditoria(
    distratoId,
    SECAO.COMUNICADO,
    "Excluiu",
    `Data: ${formatData(registro.data)} — Forma: ${LABEL_FORMA_AVISO[registro.forma]}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function registrarContato(distratoId: string, formData: FormData) {
  const dataPrevistaEntregaChaves = formData.get("dataPrevistaEntregaChaves")
    ? new Date(`${formData.get("dataPrevistaEntregaChaves")}T00:00:00`)
    : null;
  const dataPrevistaVistoriaSaida = formData.get("dataPrevistaVistoriaSaida")
    ? new Date(`${formData.get("dataPrevistaVistoriaSaida")}T00:00:00`)
    : null;
  const forma = formData.get("forma") as "LIGACAO" | "WHATSAPP";

  await prisma.contatoAcompanhamento.create({
    data: {
      distratoId,
      forma,
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
      dataPrevistaEntregaChaves,
      dataPrevistaVistoriaSaida,
      anotacoes: (formData.get("anotacoes") as string) || null,
    },
  });

  await logAuditoria(
    distratoId,
    SECAO.ACOMPANHAMENTO,
    "Registrou",
    `Forma: ${LABEL_FORMA_CONTATO[forma]}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarContato(
  contatoId: string,
  distratoId: string,
  formData: FormData
) {
  const dataPrevistaEntregaChaves = formData.get("dataPrevistaEntregaChaves")
    ? new Date(`${formData.get("dataPrevistaEntregaChaves")}T00:00:00`)
    : null;
  const dataPrevistaVistoriaSaida = formData.get("dataPrevistaVistoriaSaida")
    ? new Date(`${formData.get("dataPrevistaVistoriaSaida")}T00:00:00`)
    : null;
  const forma = formData.get("forma") as "LIGACAO" | "WHATSAPP";
  const arquivoUrl = (formData.get("arquivoUrl") as string) || null;
  const arquivoNome = (formData.get("arquivoNome") as string) || null;
  const arquivoTipo = (formData.get("arquivoTipo") as string) || null;
  const anotacoes = (formData.get("anotacoes") as string) || null;

  const antigo = await prisma.contatoAcompanhamento.findUniqueOrThrow({
    where: { id: contatoId },
  });

  await prisma.contatoAcompanhamento.update({
    where: { id: contatoId },
    data: {
      forma,
      arquivoUrl,
      arquivoNome,
      arquivoTipo,
      dataPrevistaEntregaChaves,
      dataPrevistaVistoriaSaida,
      anotacoes,
    },
  });

  const detalhe = descreverAlteracoes(
    antigo,
    { forma, arquivoUrl, dataPrevistaEntregaChaves, dataPrevistaVistoriaSaida, anotacoes },
    {
      forma: { label: "a forma", formatar: (v) => LABEL_FORMA_CONTATO[v as string] ?? String(v) },
      arquivoUrl: { label: "o arquivo anexado", arquivo: true },
      dataPrevistaEntregaChaves: { label: "a previsão de entrega de chaves" },
      dataPrevistaVistoriaSaida: { label: "a previsão de vistoria de saída" },
      anotacoes: { label: "as anotações" },
    }
  );

  await logAuditoria(distratoId, SECAO.ACOMPANHAMENTO, "Editou", detalhe);
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirContato(contatoId: string, distratoId: string) {
  const registro = await prisma.contatoAcompanhamento.findUniqueOrThrow({
    where: { id: contatoId },
  });
  await prisma.contatoAcompanhamento.delete({ where: { id: contatoId } });
  await logAuditoria(
    distratoId,
    SECAO.ACOMPANHAMENTO,
    "Excluiu",
    `Data: ${formatData(registro.data)} — Forma: ${LABEL_FORMA_CONTATO[registro.forma]}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function agendarVistoriaSaida(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  const data = new Date(`${dataStr}T00:00:00`);
  const comunicacaoDataStr = formData.get("comunicacaoData") as string | null;
  if (comunicacaoDataStr) validarNaoFutura(comunicacaoDataStr, "comunicação ao proprietário");
  const locadorNaoQuerParticipar = formData.get("locadorNaoQuerParticipar") === "on";

  await prisma.agendamentoVistoriaSaida.create({
    data: {
      distratoId,
      data,
      comunicacaoData: comunicacaoDataStr
        ? new Date(`${comunicacaoDataStr}T00:00:00`)
        : null,
      comunicacaoArquivoUrl: (formData.get("comunicacaoArquivoUrl") as string) || null,
      comunicacaoArquivoNome: (formData.get("comunicacaoArquivoNome") as string) || null,
      comunicacaoArquivoTipo: (formData.get("comunicacaoArquivoTipo") as string) || null,
      locadorNaoQuerParticipar,
      naoParticiparArquivoUrl: (formData.get("naoParticiparArquivoUrl") as string) || null,
      naoParticiparArquivoNome: (formData.get("naoParticiparArquivoNome") as string) || null,
      naoParticiparArquivoTipo: (formData.get("naoParticiparArquivoTipo") as string) || null,
    },
  });

  await logAuditoria(
    distratoId,
    SECAO.AGENDAMENTO_VISTORIA,
    "Registrou",
    `Data da vistoria: ${formatData(data)}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarAgendamentoVistoria(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  const data = new Date(`${dataStr}T00:00:00`);
  const comunicacaoDataStr = formData.get("comunicacaoData") as string | null;
  if (comunicacaoDataStr) validarNaoFutura(comunicacaoDataStr, "comunicação ao proprietário");
  const comunicacaoData = comunicacaoDataStr
    ? new Date(`${comunicacaoDataStr}T00:00:00`)
    : null;
  const comunicacaoArquivoUrl = (formData.get("comunicacaoArquivoUrl") as string) || null;
  const comunicacaoArquivoNome = (formData.get("comunicacaoArquivoNome") as string) || null;
  const comunicacaoArquivoTipo = (formData.get("comunicacaoArquivoTipo") as string) || null;
  const locadorNaoQuerParticipar = formData.get("locadorNaoQuerParticipar") === "on";
  const naoParticiparArquivoUrl = (formData.get("naoParticiparArquivoUrl") as string) || null;
  const naoParticiparArquivoNome = (formData.get("naoParticiparArquivoNome") as string) || null;
  const naoParticiparArquivoTipo = (formData.get("naoParticiparArquivoTipo") as string) || null;

  const antigo = await prisma.agendamentoVistoriaSaida.findUniqueOrThrow({
    where: { distratoId },
  });

  await prisma.agendamentoVistoriaSaida.update({
    where: { distratoId },
    data: {
      data,
      comunicacaoData,
      comunicacaoArquivoUrl,
      comunicacaoArquivoNome,
      comunicacaoArquivoTipo,
      locadorNaoQuerParticipar,
      naoParticiparArquivoUrl,
      naoParticiparArquivoNome,
      naoParticiparArquivoTipo,
    },
  });

  const detalhe = descreverAlteracoes(
    antigo,
    { data, comunicacaoData, comunicacaoArquivoUrl, locadorNaoQuerParticipar, naoParticiparArquivoUrl },
    {
      data: { label: "a data da vistoria" },
      comunicacaoData: { label: "a data de comunicação ao proprietário" },
      comunicacaoArquivoUrl: { label: "o arquivo de comunicação", arquivo: true },
      locadorNaoQuerParticipar: { label: "\"locador não quer participar\"" },
      naoParticiparArquivoUrl: { label: "o arquivo de não participação", arquivo: true },
    }
  );

  await logAuditoria(distratoId, SECAO.AGENDAMENTO_VISTORIA, "Editou", detalhe);
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirAgendamentoVistoria(distratoId: string) {
  const registro = await prisma.agendamentoVistoriaSaida.findUniqueOrThrow({
    where: { distratoId },
  });
  await prisma.agendamentoVistoriaSaida.delete({ where: { distratoId } });
  await logAuditoria(
    distratoId,
    SECAO.AGENDAMENTO_VISTORIA,
    "Excluiu",
    `Data da vistoria: ${formatData(registro.data)}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function registrarEntregaChaves(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  validarNaoFutura(dataStr, "Entrega das Chaves");
  const data = new Date(`${dataStr}T00:00:00`);
  const informeDataStr = formData.get("informeData") as string | null;
  if (informeDataStr) validarNaoFutura(informeDataStr, "informe ao locador");

  await prisma.entregaChaves.create({
    data: {
      distratoId,
      data,
      termoUrl: (formData.get("termoUrl") as string) || null,
      termoNome: (formData.get("termoNome") as string) || null,
      termoTipo: (formData.get("termoTipo") as string) || null,
      informeData: informeDataStr ? new Date(`${informeDataStr}T00:00:00`) : null,
      informeArquivoUrl: (formData.get("informeArquivoUrl") as string) || null,
      informeArquivoNome: (formData.get("informeArquivoNome") as string) || null,
      informeArquivoTipo: (formData.get("informeArquivoTipo") as string) || null,
    },
  });

  await logAuditoria(
    distratoId,
    SECAO.ENTREGA_CHAVES,
    "Registrou",
    `Data: ${formatData(data)}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarEntregaChaves(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  validarNaoFutura(dataStr, "Entrega das Chaves");
  const data = new Date(`${dataStr}T00:00:00`);
  const termoUrl = (formData.get("termoUrl") as string) || null;
  const termoNome = (formData.get("termoNome") as string) || null;
  const termoTipo = (formData.get("termoTipo") as string) || null;
  const informeDataStr = formData.get("informeData") as string | null;
  if (informeDataStr) validarNaoFutura(informeDataStr, "informe ao locador");
  const informeData = informeDataStr ? new Date(`${informeDataStr}T00:00:00`) : null;
  const informeArquivoUrl = (formData.get("informeArquivoUrl") as string) || null;
  const informeArquivoNome = (formData.get("informeArquivoNome") as string) || null;
  const informeArquivoTipo = (formData.get("informeArquivoTipo") as string) || null;

  const antigo = await prisma.entregaChaves.findUniqueOrThrow({
    where: { distratoId },
  });

  await prisma.entregaChaves.update({
    where: { distratoId },
    data: {
      data,
      termoUrl,
      termoNome,
      termoTipo,
      informeData,
      informeArquivoUrl,
      informeArquivoNome,
      informeArquivoTipo,
    },
  });

  const detalhe = descreverAlteracoes(
    antigo,
    { data, termoUrl, informeData, informeArquivoUrl },
    {
      data: { label: "a data" },
      termoUrl: { label: "o termo de entrega de chaves", arquivo: true },
      informeData: { label: "a data do informe ao locador" },
      informeArquivoUrl: { label: "o arquivo do informe", arquivo: true },
    }
  );

  await logAuditoria(distratoId, SECAO.ENTREGA_CHAVES, "Editou", detalhe);
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirEntregaChaves(distratoId: string) {
  const registro = await prisma.entregaChaves.findUniqueOrThrow({
    where: { distratoId },
  });
  await prisma.entregaChaves.delete({ where: { distratoId } });
  await logAuditoria(
    distratoId,
    SECAO.ENTREGA_CHAVES,
    "Excluiu",
    `Data: ${formatData(registro.data)}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function registrarVistoriaSaida(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  validarNaoFutura(dataStr, "Vistoria de Saída");
  const data = new Date(`${dataStr}T00:00:00`);

  await prisma.vistoriaSaida.create({
    data: {
      distratoId,
      data,
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
    },
  });

  await logAuditoria(
    distratoId,
    SECAO.VISTORIA_SAIDA,
    "Registrou",
    `Data: ${formatData(data)}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarVistoriaSaida(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  validarNaoFutura(dataStr, "Vistoria de Saída");
  const data = new Date(`${dataStr}T00:00:00`);
  const arquivoUrl = (formData.get("arquivoUrl") as string) || null;
  const arquivoNome = (formData.get("arquivoNome") as string) || null;
  const arquivoTipo = (formData.get("arquivoTipo") as string) || null;

  const antigo = await prisma.vistoriaSaida.findUniqueOrThrow({
    where: { distratoId },
  });

  await prisma.vistoriaSaida.update({
    where: { distratoId },
    data: { data, arquivoUrl, arquivoNome, arquivoTipo },
  });

  const detalhe = descreverAlteracoes(antigo, { data, arquivoUrl }, {
    data: { label: "a data" },
    arquivoUrl: { label: "o arquivo anexado", arquivo: true },
  });

  await logAuditoria(distratoId, SECAO.VISTORIA_SAIDA, "Editou", detalhe);
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirVistoriaSaida(distratoId: string) {
  const registro = await prisma.vistoriaSaida.findUniqueOrThrow({
    where: { distratoId },
  });
  await prisma.vistoriaSaida.delete({ where: { distratoId } });
  await logAuditoria(
    distratoId,
    SECAO.VISTORIA_SAIDA,
    "Excluiu",
    `Data: ${formatData(registro.data)}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function atualizarVistoriaSaida(
  vistoriaId: string,
  distratoId: string,
  formData: FormData
) {
  const locadorCompareceu = formData.get("locadorCompareceu") === "on";
  const locatarioParticipou = formData.get("locatarioParticipou") === "on";
  const informeDataStr = formData.get("informeData") as string | null;
  if (informeDataStr) validarNaoFutura(informeDataStr, "informe ao locador");
  const informeData = informeDataStr ? new Date(`${informeDataStr}T00:00:00`) : null;
  const informeArquivoUrl = (formData.get("informeArquivoUrl") as string) || null;
  const informeArquivoNome = (formData.get("informeArquivoNome") as string) || null;
  const informeArquivoTipo = (formData.get("informeArquivoTipo") as string) || null;
  const dataEntregaLaudoStr = formData.get("dataEntregaLaudo") as string | null;
  if (dataEntregaLaudoStr) validarNaoFutura(dataEntregaLaudoStr, "entrega do laudo");
  const dataEntregaLaudo = dataEntregaLaudoStr
    ? new Date(`${dataEntregaLaudoStr}T00:00:00`)
    : null;
  const laudoArquivoUrl = (formData.get("laudoArquivoUrl") as string) || null;
  const laudoArquivoNome = (formData.get("laudoArquivoNome") as string) || null;
  const laudoArquivoTipo = (formData.get("laudoArquivoTipo") as string) || null;

  const antigo = await prisma.vistoriaSaida.findUniqueOrThrow({
    where: { id: vistoriaId },
  });

  await prisma.vistoriaSaida.update({
    where: { id: vistoriaId },
    data: {
      locadorCompareceu,
      locatarioParticipou,
      informeData,
      informeArquivoUrl,
      informeArquivoNome,
      informeArquivoTipo,
      dataEntregaLaudo,
      laudoArquivoUrl,
      laudoArquivoNome,
      laudoArquivoTipo,
    },
  });

  const detalhe = descreverAlteracoes(
    antigo,
    {
      locadorCompareceu,
      locatarioParticipou,
      informeData,
      informeArquivoUrl,
      dataEntregaLaudo,
      laudoArquivoUrl,
    },
    {
      locadorCompareceu: { label: "\"locador compareceu\"" },
      locatarioParticipou: { label: "\"locatário participou\"" },
      informeData: { label: "a data do informe ao locador" },
      informeArquivoUrl: { label: "o arquivo do informe", arquivo: true },
      dataEntregaLaudo: { label: "a data de entrega do laudo" },
      laudoArquivoUrl: { label: "o arquivo do laudo", arquivo: true },
    }
  );

  await logAuditoria(distratoId, SECAO.VISTORIA_SAIDA, "Editou", detalhe);
  revalidatePath(`/distrato/${distratoId}`);
}
