import { adicionarDiasUteis, diasUteisEntre } from "./diasUteis";
import { diasEntreDatas, formatData } from "./datahora";

export const PRAZO_VISTORIA_DIAS_UTEIS = 5;

export const LABEL_TIPO_VISTORIA: Record<string, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
};

type VistoriaPrazo = {
  createdAt: Date;
  status: string;
  entregueData: Date | null;
};

export function prazoVistoria(solicitadaEm: Date): Date {
  return adicionarDiasUteis(solicitadaEm, PRAZO_VISTORIA_DIAS_UTEIS);
}

export function entregueNoPrazo(v: VistoriaPrazo): boolean | null {
  if (v.status !== "ENTREGUE" || !v.entregueData) return null;
  return v.entregueData <= prazoVistoria(v.createdAt);
}

export function diasUteisAteEntrega(v: VistoriaPrazo): number | null {
  if (v.status !== "ENTREGUE" || !v.entregueData) return null;
  return diasUteisEntre(v.createdAt, v.entregueData);
}

export type SituacaoVistoria = {
  rotulo: string;
  detalhe: string;
  texto: string;
  cor: string;
};

const COR_VERDE = "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
const COR_VERMELHA = "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
const COR_AMBAR = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";

export function situacaoVistoria(v: VistoriaPrazo, hoje: Date): SituacaoVistoria {
  const limite = prazoVistoria(v.createdAt);
  if (v.status === "ENTREGUE" && v.entregueData) {
    const atraso = diasEntreDatas(v.entregueData, limite);
    if (atraso <= 0) {
      return {
        rotulo: "Entregue no prazo",
        detalhe: `Entregue em ${formatData(v.entregueData)}`,
        texto: `Entregue em ${formatData(v.entregueData)} — dentro do prazo`,
        cor: COR_VERDE,
      };
    }
    const dias = `${atraso} ${atraso === 1 ? "dia" : "dias"}`;
    return {
      rotulo: "Entregue com atraso",
      detalhe: `Entregue em ${formatData(v.entregueData)} (${dias} após o prazo)`,
      texto: `Entregue em ${formatData(v.entregueData)} — ${dias} após o prazo`,
      cor: COR_VERMELHA,
    };
  }
  if (hoje > limite) {
    return {
      rotulo: "Prazo vencido",
      detalhe: `Venceu em ${formatData(limite)}`,
      texto: "Pendente — prazo vencido",
      cor: COR_VERMELHA,
    };
  }
  return {
    rotulo: "Pendente",
    detalhe: `Entregar até ${formatData(limite)}`,
    texto: "Pendente",
    cor: COR_AMBAR,
  };
}
