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

// Meses completos decorridos entre duas datas (não arredonda para cima).
// Ex.: início 10/01 até 09/03 = 1 mês completo; até 10/03 = 2 meses.
export function mesesEntreDatas(inicio: Date, fim: Date): number {
  let total =
    (fim.getFullYear() - inicio.getFullYear()) * 12 +
    (fim.getMonth() - inicio.getMonth());
  if (fim.getDate() < inicio.getDate()) total -= 1;
  return total;
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

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// Formata uma competência "YYYY-MM" (de um <input type="month">) como "Mês/AAAA".
export function formatMesCompetencia(mesCompetencia: string): string {
  const [ano, mes] = mesCompetencia.split("-");
  const nome = MESES[parseInt(mes, 10) - 1] ?? mes;
  return `${nome}/${ano}`;
}

export function addMeses(data: Date, meses: number): Date {
  const nova = new Date(data);
  nova.setMonth(nova.getMonth() + meses);
  return nova;
}
