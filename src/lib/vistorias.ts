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

export function situacaoVistoria(
  v: VistoriaPrazo,
  hoje: Date
): { texto: string; cor: string } {
  const limite = prazoVistoria(v.createdAt);
  if (v.status === "ENTREGUE" && v.entregueData) {
    const atraso = diasEntreDatas(v.entregueData, limite);
    if (atraso <= 0) {
      return {
        texto: `Entregue em ${formatData(v.entregueData)} — dentro do prazo`,
        cor: "text-green-700 dark:text-green-400",
      };
    }
    return {
      texto: `Entregue em ${formatData(v.entregueData)} — ${atraso} ${atraso === 1 ? "dia" : "dias"} após o prazo`,
      cor: "text-red-700 dark:text-red-400",
    };
  }
  if (hoje > limite) {
    return { texto: "Pendente — prazo vencido", cor: "text-red-700 dark:text-red-400" };
  }
  return { texto: "Pendente", cor: "text-amber-700 dark:text-amber-400" };
}
