const FUSO = "America/Sao_Paulo";

export function formatDataHora(data: Date): string {
  return data.toLocaleString("pt-BR", { timeZone: FUSO });
}

export function formatData(data: Date): string {
  return data.toLocaleDateString("pt-BR", { timeZone: FUSO });
}

export function formatSistema(data: Date): string {
  const dataStr = data.toLocaleDateString("pt-BR", { timeZone: FUSO });
  const horaStr = data.toLocaleTimeString("pt-BR", {
    timeZone: FUSO,
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Sistema: ${dataStr} - ${horaStr.replace(":", "h")}`;
}
