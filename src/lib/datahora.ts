const FUSO = "America/Sao_Paulo";

export function formatDataHora(data: Date): string {
  return data.toLocaleString("pt-BR", { timeZone: FUSO });
}

export function formatData(data: Date): string {
  return data.toLocaleDateString("pt-BR", { timeZone: FUSO });
}
