import { diasEntreDatas } from "./datahora";

type DistratoParaMetrica = {
  id: string;
  createdAt: Date;
  avisoPrevio: { data: Date } | null;
  comunicadoLocador: { data: Date } | null;
  contatos: { data: Date }[];
  entregaChaves: { data: Date } | null;
  vistoriaSaida: { data: Date } | null;
  comunicadoVistoria: { data: Date | null } | null;
  laudoVistoria: { data: Date } | null;
  comunicadoEncerramentoLocador: { data: Date } | null;
  comunicadoEncerramentoLocatario: { data: Date } | null;
};

function diffDias(inicio: Date | null | undefined, fim: Date | null | undefined): number | null {
  if (!inicio || !fim) return null;
  return (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
}

function media(valores: number[]): number | null {
  if (valores.length === 0) return null;
  return valores.reduce((soma, v) => soma + v, 0) / valores.length;
}

function primeiroContato(contatos: { data: Date }[]): Date | null {
  if (contatos.length === 0) return null;
  return contatos.reduce((min, c) => (c.data < min.data ? c : min)).data;
}

type ContagemPrazo = { noPrazo: number; foraPrazo: number; semRegistro: number };

export type MetricasDistrato = {
  totalDistratos: number;
  concluidos: number;
  emAndamento: number;
  prazoComunicadoLocador: ContagemPrazo;
  prazoContato: ContagemPrazo;
  prazoEntregaChaves: ContagemPrazo;
  prazoComunicadoVistoria: ContagemPrazo;
  mediaDiasAteContato: number | null;
  mediaDiasAteEntregaChaves: number | null;
  mediaDiasEntregaAteVistoria: number | null;
  mediaDiasVistoriaAteLaudo: number | null;
  mediaDiasLaudoAteComunicadoEncerramento: number | null;
  mediaDiasComunicadoAteEncerramento: number | null;
  mediaDiasTotal: number | null;
  gargalo: { etapa: string; media: number } | null;
};

export function calcularMetricasDistrato(
  distratos: DistratoParaMetrica[]
): MetricasDistrato {
  const prazoComunicadoLocador: ContagemPrazo = { noPrazo: 0, foraPrazo: 0, semRegistro: 0 };
  const prazoContato: ContagemPrazo = { noPrazo: 0, foraPrazo: 0, semRegistro: 0 };
  const prazoEntregaChaves: ContagemPrazo = { noPrazo: 0, foraPrazo: 0, semRegistro: 0 };
  const prazoComunicadoVistoria: ContagemPrazo = { noPrazo: 0, foraPrazo: 0, semRegistro: 0 };

  const diasAteContato: number[] = [];
  const diasAteEntregaChaves: number[] = [];
  const diasEntregaAteVistoria: number[] = [];
  const diasVistoriaAteLaudo: number[] = [];
  const diasLaudoAteComunicadoEncerramento: number[] = [];
  const diasComunicadoAteEncerramento: number[] = [];
  const diasTotal: number[] = [];

  let concluidos = 0;

  for (const d of distratos) {
    const aviso = d.avisoPrevio?.data ?? null;
    const contato = primeiroContato(d.contatos);
    const entregaChaves = d.entregaChaves?.data ?? null;
    const vistoria = d.vistoriaSaida?.data ?? null;
    const laudo = d.laudoVistoria?.data ?? null;
    const comunicadoEncerramento = d.comunicadoEncerramentoLocador?.data ?? null;
    const encerramento = d.comunicadoEncerramentoLocatario?.data ?? null;

    // Comunicado ao Locador: mesmo dia do Aviso Prévio.
    if (aviso) {
      if (!d.comunicadoLocador) prazoComunicadoLocador.semRegistro += 1;
      else if (diasEntreDatas(d.comunicadoLocador.data, aviso) === 0)
        prazoComunicadoLocador.noPrazo += 1;
      else prazoComunicadoLocador.foraPrazo += 1;
    }

    // Contato de Acompanhamento: até 15 dias após o Aviso Prévio.
    if (aviso) {
      const prazoLimite = new Date(aviso);
      prazoLimite.setDate(prazoLimite.getDate() + 15);
      if (!contato) prazoContato.semRegistro += 1;
      else if (contato <= prazoLimite) prazoContato.noPrazo += 1;
      else prazoContato.foraPrazo += 1;
    }

    // Entrega de Chaves: até 30 dias após o Aviso Prévio.
    if (aviso) {
      const prazoLimite = new Date(aviso);
      prazoLimite.setDate(prazoLimite.getDate() + 30);
      if (!entregaChaves) prazoEntregaChaves.semRegistro += 1;
      else if (entregaChaves <= prazoLimite) prazoEntregaChaves.noPrazo += 1;
      else prazoEntregaChaves.foraPrazo += 1;
    }

    // Comunicado da Vistoria: mesmo dia da Entrega de Chaves.
    if (entregaChaves) {
      if (!d.comunicadoVistoria?.data) prazoComunicadoVistoria.semRegistro += 1;
      else if (diasEntreDatas(d.comunicadoVistoria.data, entregaChaves) === 0)
        prazoComunicadoVistoria.noPrazo += 1;
      else prazoComunicadoVistoria.foraPrazo += 1;
    }

    const dAteContato = diffDias(aviso, contato);
    if (dAteContato !== null) diasAteContato.push(dAteContato);

    const dAteEntregaChaves = diffDias(aviso, entregaChaves);
    if (dAteEntregaChaves !== null) diasAteEntregaChaves.push(dAteEntregaChaves);

    const dEntregaAteVistoria = diffDias(entregaChaves, vistoria);
    if (dEntregaAteVistoria !== null) diasEntregaAteVistoria.push(dEntregaAteVistoria);

    const dVistoriaAteLaudo = diffDias(vistoria, laudo);
    if (dVistoriaAteLaudo !== null) diasVistoriaAteLaudo.push(dVistoriaAteLaudo);

    const dLaudoAteComunicado = diffDias(laudo, comunicadoEncerramento);
    if (dLaudoAteComunicado !== null)
      diasLaudoAteComunicadoEncerramento.push(dLaudoAteComunicado);

    const dComunicadoAteEncerramento = diffDias(comunicadoEncerramento, encerramento);
    if (dComunicadoAteEncerramento !== null)
      diasComunicadoAteEncerramento.push(dComunicadoAteEncerramento);

    const dTotal = diffDias(aviso, encerramento);
    if (dTotal !== null) {
      diasTotal.push(dTotal);
      concluidos += 1;
    }
  }

  const etapas: { etapa: string; media: number | null }[] = [
    { etapa: "Aviso Prévio até primeiro contato", media: media(diasAteContato) },
    { etapa: "Aviso Prévio até Entrega de Chaves", media: media(diasAteEntregaChaves) },
    { etapa: "Entrega de Chaves até Vistoria de Saída", media: media(diasEntregaAteVistoria) },
    { etapa: "Vistoria de Saída até Laudo", media: media(diasVistoriaAteLaudo) },
    {
      etapa: "Laudo até Comunicado de Encerramento ao Locador",
      media: media(diasLaudoAteComunicadoEncerramento),
    },
    {
      etapa: "Comunicado ao Locador até Encerramento ao Locatário",
      media: media(diasComunicadoAteEncerramento),
    },
  ];

  const gargaloEncontrado = etapas
    .filter((e): e is { etapa: string; media: number } => e.media !== null)
    .sort((a, b) => b.media - a.media)[0];

  return {
    totalDistratos: distratos.length,
    concluidos,
    emAndamento: distratos.length - concluidos,
    prazoComunicadoLocador,
    prazoContato,
    prazoEntregaChaves,
    prazoComunicadoVistoria,
    mediaDiasAteContato: media(diasAteContato),
    mediaDiasAteEntregaChaves: media(diasAteEntregaChaves),
    mediaDiasEntregaAteVistoria: media(diasEntregaAteVistoria),
    mediaDiasVistoriaAteLaudo: media(diasVistoriaAteLaudo),
    mediaDiasLaudoAteComunicadoEncerramento: media(diasLaudoAteComunicadoEncerramento),
    mediaDiasComunicadoAteEncerramento: media(diasComunicadoAteEncerramento),
    mediaDiasTotal: media(diasTotal),
    gargalo: gargaloEncontrado ?? null,
  };
}

export function formatDias(valor: number | null): string {
  if (valor === null) return "—";
  return `${valor.toFixed(1)} dia${valor.toFixed(1) === "1.0" ? "" : "s"}`;
}
