import { diasEntreDatas, formatData } from "./datahora";
import { adicionarDiasUteis } from "./diasUteis";

export type Sinal = { texto: string; cor: string };

const VERDE = "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
const VERMELHO = "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
const AMBAR = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";

const dias = (n: number) => `${n} ${n === 1 ? "dia" : "dias"}`;

export const PRAZO_AVISO_PREVIO_DIAS = 30;
export const PRAZO_LAUDO_DIAS_UTEIS = 5;

export function sinalEntregaChaves(dataAviso: Date, dataEntrega: Date): Sinal {
  const limite = new Date(dataAviso);
  limite.setDate(limite.getDate() + PRAZO_AVISO_PREVIO_DIAS);
  const aposAviso = diasEntreDatas(dataEntrega, dataAviso);
  const alemDoPrazo = diasEntreDatas(dataEntrega, limite);

  if (alemDoPrazo <= 0) {
    return {
      texto: `Dentro do prazo do aviso prévio — ${dias(aposAviso)} após o aviso (limite: ${PRAZO_AVISO_PREVIO_DIAS} dias)`,
      cor: VERDE,
    };
  }
  return {
    texto: `Fora do prazo do aviso prévio — ${dias(aposAviso)} após o aviso (${dias(alemDoPrazo)} além dos ${PRAZO_AVISO_PREVIO_DIAS} dias)`,
    cor: VERMELHO,
  };
}

export function sinalVistoriaSaida(dataAgendada: Date, dataRealizada: Date): Sinal {
  const diferenca = diasEntreDatas(dataRealizada, dataAgendada);
  if (diferenca === 0) return { texto: "Realizada na data agendada", cor: VERDE };
  if (diferenca > 0) {
    return { texto: `Realizada ${dias(diferenca)} depois da data agendada`, cor: VERMELHO };
  }
  return { texto: `Realizada ${dias(Math.abs(diferenca))} antes da data agendada`, cor: AMBAR };
}

export function prazoLaudo(dataVistoria: Date): Date {
  return adicionarDiasUteis(dataVistoria, PRAZO_LAUDO_DIAS_UTEIS);
}

export function sinalLaudo(dataVistoria: Date, dataLaudo: Date): Sinal {
  const limite = prazoLaudo(dataVistoria);
  const atraso = diasEntreDatas(dataLaudo, limite);
  if (atraso <= 0) {
    return { texto: `Entregue no prazo (limite: ${formatData(limite)})`, cor: VERDE };
  }
  return {
    texto: `Entregue fora do prazo — ${dias(atraso)} depois do limite de ${formatData(limite)}`,
    cor: VERMELHO,
  };
}
