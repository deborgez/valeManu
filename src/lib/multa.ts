import { mesesEntreDatas } from "./datahora";

const TIPOS_GARANTIA_PROPORCIONAL: string[] = ["FIADOR", "SEM_GARANTIA"];

export type ResultadoMulta = {
  multaTotal: number;
  multaMensal: number;
  mesesDecorridos: number;
  mesesRestantes: number;
  multaAtual: number;
};

export function calcularMulta({
  valorAluguel,
  tipoFianca,
  prazoContratoMeses,
  prazoMultaMeses,
  dataInicio,
  dataReferencia,
}: {
  valorAluguel: number;
  tipoFianca: string | null;
  prazoContratoMeses: number | null;
  prazoMultaMeses: number | null;
  dataInicio: Date | null;
  dataReferencia: Date;
}): ResultadoMulta | null {
  if (!prazoContratoMeses || !prazoMultaMeses || !dataInicio) return null;

  const multaTotal =
    tipoFianca && TIPOS_GARANTIA_PROPORCIONAL.includes(tipoFianca)
      ? valorAluguel * prazoContratoMeses * 0.1
      : valorAluguel * 3;

  const multaMensal = multaTotal / prazoMultaMeses;

  const mesesDecorridos = Math.min(
    Math.max(mesesEntreDatas(dataInicio, dataReferencia), 0),
    prazoMultaMeses
  );
  const mesesRestantes = prazoMultaMeses - mesesDecorridos;
  const multaAtual = multaMensal * mesesRestantes;

  return { multaTotal, multaMensal, mesesDecorridos, mesesRestantes, multaAtual };
}
