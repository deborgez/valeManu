const FUSO = "America/Sao_Paulo";

export function formatDataHora(data: Date): string {
  return data.toLocaleString("pt-BR", { timeZone: FUSO });
}

export function formatData(data: Date): string {
  return data.toLocaleDateString("pt-BR", { timeZone: FUSO });
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
