"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { formatData, hojeSaoPaulo } from "@/lib/datahora";
import { LABEL_FORMA_AVISO, LABEL_FORMA_CONTATO, LABEL_LOCAL_ENTREGA } from "@/lib/labels";

const SECAO = {
  AVISO_PREVIO: "AVISO_PREVIO",
  COMUNICADO: "COMUNICADO",
  ACOMPANHAMENTO: "ACOMPANHAMENTO",
  LOCAL_ENTREGA_CHAVES: "LOCAL_ENTREGA_CHAVES",
  ENTREGA_CHAVES: "ENTREGA_CHAVES",
  AGENDAMENTO_VISTORIA: "AGENDAMENTO_VISTORIA",
  COMUNICADO_VISTORIA: "COMUNICADO_VISTORIA",
  VISTORIA_SAIDA: "VISTORIA_SAIDA",
  FOTOS_VISTORIA: "FOTOS_VISTORIA",
  LAUDO_VISTORIA: "LAUDO_VISTORIA",
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
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

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
      criadoPorId: session.user.id,
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

  if (detalhe) {
    await logAuditoria(distratoId, SECAO.AVISO_PREVIO, "Editou", detalhe);
  }
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
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

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
      criadoPorId: session.user.id,
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

  if (detalhe) {
    await logAuditoria(distratoId, SECAO.COMUNICADO, "Editou", detalhe);
  }
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
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

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
      criadoPorId: session.user.id,
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

  if (detalhe) {
    await logAuditoria(distratoId, SECAO.ACOMPANHAMENTO, "Editou", detalhe);
  }
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
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const dataStr = String(formData.get("data"));
  const data = new Date(`${dataStr}T00:00:00`);
  const hora = (formData.get("hora") as string) || null;

  await prisma.agendamentoVistoriaSaida.create({
    data: {
      distratoId,
      data,
      hora,
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
      criadoPorId: session.user.id,
    },
  });

  await logAuditoria(
    distratoId,
    SECAO.AGENDAMENTO_VISTORIA,
    "Registrou",
    `Data da vistoria: ${formatData(data)}${hora ? ` às ${hora}` : ""}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarAgendamentoVistoria(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  const data = new Date(`${dataStr}T00:00:00`);
  const hora = (formData.get("hora") as string) || null;
  const arquivoUrl = (formData.get("arquivoUrl") as string) || null;
  const arquivoNome = (formData.get("arquivoNome") as string) || null;
  const arquivoTipo = (formData.get("arquivoTipo") as string) || null;

  const antigo = await prisma.agendamentoVistoriaSaida.findUniqueOrThrow({
    where: { distratoId },
  });

  await prisma.agendamentoVistoriaSaida.update({
    where: { distratoId },
    data: { data, hora, arquivoUrl, arquivoNome, arquivoTipo },
  });

  const detalhe = descreverAlteracoes(antigo, { data, hora, arquivoUrl }, {
    data: { label: "a data da vistoria" },
    hora: { label: "o horário da vistoria" },
    arquivoUrl: { label: "o arquivo anexado", arquivo: true },
  });

  if (detalhe) {
    await logAuditoria(distratoId, SECAO.AGENDAMENTO_VISTORIA, "Editou", detalhe);
  }
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

export async function definirLocalEntregaChaves(
  distratoId: string,
  formData: FormData
) {
  const local = formData.get("local") as "IMOVEL" | "IMOBILIARIA";

  await prisma.distrato.update({
    where: { id: distratoId },
    data: { localEntregaChaves: local },
  });

  await logAuditoria(
    distratoId,
    SECAO.LOCAL_ENTREGA_CHAVES,
    "Registrou",
    `Local: ${LABEL_LOCAL_ENTREGA[local]}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function registrarEntregaChaves(
  distratoId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const dataStr = String(formData.get("data"));
  validarNaoFutura(dataStr, "Entrega das Chaves");
  const data = new Date(`${dataStr}T00:00:00`);
  const hora = (formData.get("hora") as string) || null;

  await prisma.entregaChaves.create({
    data: {
      distratoId,
      data,
      hora,
      termoUrl: (formData.get("termoUrl") as string) || null,
      termoNome: (formData.get("termoNome") as string) || null,
      termoTipo: (formData.get("termoTipo") as string) || null,
      criadoPorId: session.user.id,
    },
  });

  await logAuditoria(
    distratoId,
    SECAO.ENTREGA_CHAVES,
    "Registrou",
    `Data: ${formatData(data)}${hora ? ` às ${hora}` : ""}`
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
  const hora = (formData.get("hora") as string) || null;
  const termoUrl = (formData.get("termoUrl") as string) || null;
  const termoNome = (formData.get("termoNome") as string) || null;
  const termoTipo = (formData.get("termoTipo") as string) || null;

  const antigo = await prisma.entregaChaves.findUniqueOrThrow({
    where: { distratoId },
  });

  await prisma.entregaChaves.update({
    where: { distratoId },
    data: { data, hora, termoUrl, termoNome, termoTipo },
  });

  const detalhe = descreverAlteracoes(
    antigo,
    { data, hora, termoUrl },
    {
      data: { label: "a data" },
      hora: { label: "o horário" },
      termoUrl: { label: "o termo de entrega de chaves", arquivo: true },
    }
  );

  if (detalhe) {
    await logAuditoria(distratoId, SECAO.ENTREGA_CHAVES, "Editou", detalhe);
  }
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

export async function registrarComunicadoVistoria(
  distratoId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const locadorDesejaParticipar = formData.get("locadorDesejaParticipar") === "on";
  const dataStr = formData.get("data") as string | null;
  const data = dataStr ? new Date(`${dataStr}T00:00:00`) : null;
  const forma = formData.get("forma") as "LIGACAO" | "WHATSAPP" | null;

  await prisma.comunicadoVistoriaSaida.create({
    data: {
      distratoId,
      data,
      forma,
      locadorDesejaParticipar,
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
      criadoPorId: session.user.id,
    },
  });

  await logAuditoria(
    distratoId,
    SECAO.COMUNICADO_VISTORIA,
    "Registrou",
    `Data: ${data ? formatData(data) : "—"}${forma ? ` — Forma: ${LABEL_FORMA_CONTATO[forma]}` : ""} — Locador ${locadorDesejaParticipar ? "deseja" : "não deseja"} participar`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarComunicadoVistoria(
  distratoId: string,
  formData: FormData
) {
  const locadorDesejaParticipar = formData.get("locadorDesejaParticipar") === "on";
  const dataStr = formData.get("data") as string | null;
  const data = dataStr ? new Date(`${dataStr}T00:00:00`) : null;
  const forma = formData.get("forma") as "LIGACAO" | "WHATSAPP" | null;
  const arquivoUrl = (formData.get("arquivoUrl") as string) || null;
  const arquivoNome = (formData.get("arquivoNome") as string) || null;
  const arquivoTipo = (formData.get("arquivoTipo") as string) || null;

  const antigo = await prisma.comunicadoVistoriaSaida.findUniqueOrThrow({
    where: { distratoId },
  });

  await prisma.comunicadoVistoriaSaida.update({
    where: { distratoId },
    data: { data, forma, locadorDesejaParticipar, arquivoUrl, arquivoNome, arquivoTipo },
  });

  const detalhe = descreverAlteracoes(
    antigo,
    { data, forma, locadorDesejaParticipar, arquivoUrl },
    {
      data: { label: "a data" },
      forma: { label: "a forma", formatar: (v) => (v ? LABEL_FORMA_CONTATO[v as string] : "vazio") },
      locadorDesejaParticipar: { label: "\"locador deseja participar\"" },
      arquivoUrl: { label: "o arquivo anexado", arquivo: true },
    }
  );

  if (detalhe) {
    await logAuditoria(distratoId, SECAO.COMUNICADO_VISTORIA, "Editou", detalhe);
  }
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirComunicadoVistoria(distratoId: string) {
  const registro = await prisma.comunicadoVistoriaSaida.findUniqueOrThrow({
    where: { distratoId },
  });
  await prisma.comunicadoVistoriaSaida.delete({ where: { distratoId } });
  await logAuditoria(
    distratoId,
    SECAO.COMUNICADO_VISTORIA,
    "Excluiu",
    `Data: ${registro.data ? formatData(registro.data) : "—"}${registro.forma ? ` — Forma: ${LABEL_FORMA_CONTATO[registro.forma]}` : ""}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function registrarVistoriaSaida(
  distratoId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const dataStr = String(formData.get("data"));
  validarNaoFutura(dataStr, "Vistoria de Saída");
  const data = new Date(`${dataStr}T00:00:00`);
  const hora = (formData.get("hora") as string) || null;
  const responsavel = (formData.get("responsavel") as string) || null;
  const observacoes = (formData.get("observacoes") as string) || null;
  const locadorCompareceu = formData.get("locadorCompareceu") === "on";

  await prisma.vistoriaSaida.create({
    data: {
      distratoId,
      data,
      hora,
      responsavel,
      observacoes,
      locadorCompareceu,
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
      criadoPorId: session.user.id,
    },
  });

  await logAuditoria(
    distratoId,
    SECAO.VISTORIA_SAIDA,
    "Registrou",
    `Data: ${formatData(data)}${hora ? ` às ${hora}` : ""}${responsavel ? ` — Responsável: ${responsavel}` : ""}`
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
  const hora = (formData.get("hora") as string) || null;
  const responsavel = (formData.get("responsavel") as string) || null;
  const observacoes = (formData.get("observacoes") as string) || null;
  const locadorCompareceu = formData.get("locadorCompareceu") === "on";
  const arquivoUrl = (formData.get("arquivoUrl") as string) || null;
  const arquivoNome = (formData.get("arquivoNome") as string) || null;
  const arquivoTipo = (formData.get("arquivoTipo") as string) || null;

  const antigo = await prisma.vistoriaSaida.findUniqueOrThrow({
    where: { distratoId },
  });

  await prisma.vistoriaSaida.update({
    where: { distratoId },
    data: {
      data,
      hora,
      responsavel,
      observacoes,
      locadorCompareceu,
      arquivoUrl,
      arquivoNome,
      arquivoTipo,
    },
  });

  const detalhe = descreverAlteracoes(
    antigo,
    { data, hora, responsavel, observacoes, locadorCompareceu, arquivoUrl },
    {
      data: { label: "a data" },
      hora: { label: "o horário" },
      responsavel: { label: "o responsável" },
      observacoes: { label: "as observações" },
      locadorCompareceu: { label: "\"locador compareceu\"" },
      arquivoUrl: { label: "o arquivo anexado", arquivo: true },
    }
  );

  if (detalhe) {
    await logAuditoria(distratoId, SECAO.VISTORIA_SAIDA, "Editou", detalhe);
  }
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

export async function registrarFotosVistoria(
  distratoId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const dataStr = String(formData.get("data"));
  validarNaoFutura(dataStr, "Fotos da Vistoria");
  const data = new Date(`${dataStr}T00:00:00`);

  await prisma.fotosVistoria.create({
    data: { distratoId, data, criadoPorId: session.user.id },
  });

  await logAuditoria(
    distratoId,
    SECAO.FOTOS_VISTORIA,
    "Registrou",
    `Data: ${formatData(data)}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarFotosVistoria(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  validarNaoFutura(dataStr, "Fotos da Vistoria");
  const data = new Date(`${dataStr}T00:00:00`);

  const antigo = await prisma.fotosVistoria.findUniqueOrThrow({
    where: { distratoId },
  });

  await prisma.fotosVistoria.update({
    where: { distratoId },
    data: { data },
  });

  const detalhe = descreverAlteracoes(antigo, { data }, {
    data: { label: "a data" },
  });

  if (detalhe) {
    await logAuditoria(distratoId, SECAO.FOTOS_VISTORIA, "Editou", detalhe);
  }
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirFotosVistoria(distratoId: string) {
  const registro = await prisma.fotosVistoria.findUniqueOrThrow({
    where: { distratoId },
  });
  await prisma.fotosVistoria.delete({ where: { distratoId } });
  await logAuditoria(
    distratoId,
    SECAO.FOTOS_VISTORIA,
    "Excluiu",
    `Data: ${formatData(registro.data)}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function registrarLaudoVistoria(
  distratoId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado.");

  const dataStr = String(formData.get("data"));
  validarNaoFutura(dataStr, "Laudo da Vistoria");
  const data = new Date(`${dataStr}T00:00:00`);

  await prisma.laudoVistoria.create({
    data: {
      distratoId,
      data,
      arquivoUrl: (formData.get("arquivoUrl") as string) || null,
      arquivoNome: (formData.get("arquivoNome") as string) || null,
      arquivoTipo: (formData.get("arquivoTipo") as string) || null,
      criadoPorId: session.user.id,
    },
  });

  await logAuditoria(
    distratoId,
    SECAO.LAUDO_VISTORIA,
    "Registrou",
    `Data: ${formatData(data)}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}

export async function editarLaudoVistoria(
  distratoId: string,
  formData: FormData
) {
  const dataStr = String(formData.get("data"));
  validarNaoFutura(dataStr, "Laudo da Vistoria");
  const data = new Date(`${dataStr}T00:00:00`);
  const arquivoUrl = (formData.get("arquivoUrl") as string) || null;
  const arquivoNome = (formData.get("arquivoNome") as string) || null;
  const arquivoTipo = (formData.get("arquivoTipo") as string) || null;

  const antigo = await prisma.laudoVistoria.findUniqueOrThrow({
    where: { distratoId },
  });

  await prisma.laudoVistoria.update({
    where: { distratoId },
    data: { data, arquivoUrl, arquivoNome, arquivoTipo },
  });

  const detalhe = descreverAlteracoes(antigo, { data, arquivoUrl }, {
    data: { label: "a data" },
    arquivoUrl: { label: "o arquivo anexado", arquivo: true },
  });

  if (detalhe) {
    await logAuditoria(distratoId, SECAO.LAUDO_VISTORIA, "Editou", detalhe);
  }
  revalidatePath(`/distrato/${distratoId}`);
}

export async function excluirLaudoVistoria(distratoId: string) {
  const registro = await prisma.laudoVistoria.findUniqueOrThrow({
    where: { distratoId },
  });
  await prisma.laudoVistoria.delete({ where: { distratoId } });
  await logAuditoria(
    distratoId,
    SECAO.LAUDO_VISTORIA,
    "Excluiu",
    `Data: ${formatData(registro.data)}`
  );
  revalidatePath(`/distrato/${distratoId}`);
}
