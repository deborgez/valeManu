type Evento = { etapa: string; createdAt: Date };

type ManutencaoParaMetrica = {
  id: string;
  createdAt: Date;
  reaberta: boolean;
  historico: Evento[];
};

function primeiraOcorrencia(historico: Evento[], etapas: string[]): Date | null {
  const evento = historico.find((h) => etapas.includes(h.etapa));
  return evento?.createdAt ?? null;
}

function ultimaOcorrencia(historico: Evento[], etapas: string[]): Date | null {
  for (let i = historico.length - 1; i >= 0; i--) {
    if (etapas.includes(historico[i].etapa)) return historico[i].createdAt;
  }
  return null;
}

function diffDias(inicio: Date | null, fim: Date | null): number | null {
  if (!inicio || !fim) return null;
  return (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
}

function media(valores: number[]): number | null {
  if (valores.length === 0) return null;
  return valores.reduce((soma, v) => soma + v, 0) / valores.length;
}

export type MetricasDesempenho = {
  totalSolicitacoes: number;
  totalConcluidas: number;
  concluidasNoPrazo: number;
  concluidasForaPrazo2a5: number;
  concluidasForaPrazo5mais: number;
  totalReabertas: number;
  taxaReabertura: number | null;
  mediaDiasAteOrcamento: number | null;
  mediaDiasAteAprovacao: number | null;
  mediaDiasAteInicio: number | null;
  mediaDiasExecucao: number | null;
  mediaDiasTotal: number | null;
  gargalo: { etapa: string; media: number } | null;
};

export function calcularMetricasDesempenho(
  manutencoes: ManutencaoParaMetrica[]
): MetricasDesempenho {
  const diasAteOrcamento: number[] = [];
  const diasAteAprovacao: number[] = [];
  const diasAteInicio: number[] = [];
  const diasExecucao: number[] = [];
  const diasTotal: number[] = [];

  let concluidasNoPrazo = 0;
  let concluidasForaPrazo2a5 = 0;
  let concluidasForaPrazo5mais = 0;
  let totalConcluidas = 0;

  for (const m of manutencoes) {
    const solicitacao = m.createdAt;
    const orcamentoEntregue = primeiraOcorrencia(m.historico, ["Orçamento entregue"]);
    const servicoAprovado = primeiraOcorrencia(m.historico, ["Serviço aprovado"]);
    const servicoIniciado = primeiraOcorrencia(m.historico, [
      "Serviço iniciado",
      "Serviço agendado",
    ]);
    const servicoConcluido = ultimaOcorrencia(m.historico, ["Serviço concluído"]);

    const dAteOrcamento = diffDias(solicitacao, orcamentoEntregue);
    if (dAteOrcamento !== null) diasAteOrcamento.push(dAteOrcamento);

    const dAteAprovacao = diffDias(orcamentoEntregue, servicoAprovado);
    if (dAteAprovacao !== null) diasAteAprovacao.push(dAteAprovacao);

    const dAteInicio = diffDias(servicoAprovado, servicoIniciado);
    if (dAteInicio !== null) diasAteInicio.push(dAteInicio);

    const dExecucao = diffDias(servicoIniciado, servicoConcluido);
    if (dExecucao !== null) diasExecucao.push(dExecucao);

    const dTotal = diffDias(solicitacao, servicoConcluido);
    if (dTotal !== null) {
      diasTotal.push(dTotal);
      totalConcluidas += 1;
      if (dTotal <= 2) concluidasNoPrazo += 1;
      else if (dTotal <= 5) concluidasForaPrazo2a5 += 1;
      else concluidasForaPrazo5mais += 1;
    }
  }

  const totalReabertas = manutencoes.filter((m) => m.reaberta).length;

  const etapas: { etapa: string; media: number | null }[] = [
    { etapa: "Solicitação até orçamento entregue", media: media(diasAteOrcamento) },
    { etapa: "Orçamento entregue até aprovação", media: media(diasAteAprovacao) },
    { etapa: "Aprovação até início do serviço", media: media(diasAteInicio) },
    { etapa: "Início até conclusão (execução)", media: media(diasExecucao) },
  ];

  const gargaloEncontrado = etapas
    .filter((e): e is { etapa: string; media: number } => e.media !== null)
    .sort((a, b) => b.media - a.media)[0];

  return {
    totalSolicitacoes: manutencoes.length,
    totalConcluidas,
    concluidasNoPrazo,
    concluidasForaPrazo2a5,
    concluidasForaPrazo5mais,
    totalReabertas,
    taxaReabertura:
      manutencoes.length > 0 ? (totalReabertas / manutencoes.length) * 100 : null,
    mediaDiasAteOrcamento: media(diasAteOrcamento),
    mediaDiasAteAprovacao: media(diasAteAprovacao),
    mediaDiasAteInicio: media(diasAteInicio),
    mediaDiasExecucao: media(diasExecucao),
    mediaDiasTotal: media(diasTotal),
    gargalo: gargaloEncontrado ?? null,
  };
}

export function formatDias(valor: number | null): string {
  if (valor === null) return "—";
  return `${valor.toFixed(1)} dia${valor.toFixed(1) === "1.0" ? "" : "s"}`;
}
