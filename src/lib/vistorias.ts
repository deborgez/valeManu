import { adicionarDiasUteis, diasUteisEntre } from "./diasUteis";
import { diasEntreDatas, formatData, hojeSaoPaulo, parseDataLocal } from "./datahora";

export const PRAZO_VISTORIA_DIAS_UTEIS = 5;

export const LABEL_TIPO_VISTORIA: Record<string, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
};

type VistoriaPrazo = {
  createdAt: Date;
  agendadaPara?: Date | null;
  status: string;
  entregueData: Date | null;
};

type BasePrazo = Date | { createdAt: Date; agendadaPara?: Date | null };

// O prazo de 5 dias úteis conta da data agendada (se houver) ou do dia da solicitação.
export function inicioDoPrazo(base: BasePrazo): Date {
  if (base instanceof Date) return base;
  return base.agendadaPara ?? base.createdAt;
}

export function prazoVistoria(base: BasePrazo): Date {
  return adicionarDiasUteis(inicioDoPrazo(base), PRAZO_VISTORIA_DIAS_UTEIS);
}

// Lê "solicitar agora" ou "agendar" do formulário e valida a data agendada.
export function lerAgendamento(formData: FormData): {
  agendadaPara: Date | null;
  horaAgendada: string | null;
} {
  if (formData.get("agendamento") !== "agendar") return { agendadaPara: null, horaAgendada: null };
  const dataStr = String(formData.get("dataAgendada") || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataStr) || dataStr < hojeSaoPaulo()) {
    throw new Error("Informe uma data de agendamento a partir de hoje.");
  }
  return {
    agendadaPara: parseDataLocal(dataStr),
    horaAgendada: String(formData.get("horaAgendada") || "") || null,
  };
}

export function entregueNoPrazo(v: VistoriaPrazo): boolean | null {
  if (v.status !== "ENTREGUE" || !v.entregueData) return null;
  return v.entregueData <= prazoVistoria(v);
}

export function diasUteisAteEntrega(v: VistoriaPrazo): number | null {
  if (v.status !== "ENTREGUE" || !v.entregueData) return null;
  return diasUteisEntre(inicioDoPrazo(v), v.entregueData);
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
  const limite = prazoVistoria(v);
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
  if (v.agendadaPara && hoje < v.agendadaPara) {
    return {
      rotulo: "Agendada",
      detalhe: `Agendada para ${formatData(v.agendadaPara)} (prazo até ${formatData(limite)})`,
      texto: `Agendada para ${formatData(v.agendadaPara)}`,
      cor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
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
