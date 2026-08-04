const FUSO = "America/Sao_Paulo";

export function formatDataHora(data: Date): string {
  return data.toLocaleString("pt-BR", { timeZone: FUSO });
}

export function formatData(data: Date): string {
  return data.toLocaleDateString("pt-BR", { timeZone: FUSO });
}

export function hojeSaoPaulo(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: FUSO });
}

// Interpreta uma data "YYYY-MM-DD" (de um <input type="date">) como meia-noite
// em São Paulo, não no fuso do servidor. Sem isso, o servidor (UTC) grava
// meia-noite UTC, que ao ser exibida em America/Sao_Paulo (UTC-3) cai no dia
// anterior.
export function parseDataLocal(dataStr: string): Date {
  return new Date(`${dataStr}T00:00:00-03:00`);
}

export function diasEntreDatas(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function formatDataHoraCurta(data: Date): string {
  const dataStr = data.toLocaleDateString("pt-BR", { timeZone: FUSO });
  const horaStr = data.toLocaleTimeString("pt-BR", {
    timeZone: FUSO,
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dataStr} - ${horaStr.replace(":", "h")}`;
}

export function formatSistema(data: Date): string {
  return `Sistema: ${formatDataHoraCurta(data)}`;
}
