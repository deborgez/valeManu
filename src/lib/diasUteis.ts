const FUSO = "America/Sao_Paulo";

function paraUtc(data: Date): Date {
  const [a, m, d] = data.toLocaleDateString("en-CA", { timeZone: FUSO }).split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

function pascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(ano, mes - 1, dia));
}

function feriadosNacionais(ano: number): Set<string> {
  const fixos = ["01-01", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "11-20", "12-25"];
  const sextaSanta = new Date(pascoa(ano).getTime() - 2 * 86400000);
  return new Set([...fixos.map((f) => `${ano}-${f}`), sextaSanta.toISOString().slice(0, 10)]);
}

export function adicionarDiasUteis(data: Date, dias: number): Date {
  const atual = paraUtc(data);
  let restantes = dias;
  while (restantes > 0) {
    atual.setUTCDate(atual.getUTCDate() + 1);
    const diaSemana = atual.getUTCDay();
    const iso = atual.toISOString().slice(0, 10);
    if (diaSemana === 0 || diaSemana === 6) continue;
    if (feriadosNacionais(atual.getUTCFullYear()).has(iso)) continue;
    restantes--;
  }
  return new Date(`${atual.toISOString().slice(0, 10)}T00:00:00-03:00`);
}
