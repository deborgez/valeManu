export function diasEmAberto(createdAt: Date, diasPausados = 0): number {
  const ms = Date.now() - createdAt.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)) - diasPausados);
}

export type Severidade = "neutro" | "verde" | "amarelo" | "vermelho";

export function classificarSeveridade(dias: number, aberta: boolean): Severidade {
  if (!aberta) return "neutro";
  if (dias >= 3) return "vermelho";
  if (dias >= 2) return "amarelo";
  return "verde";
}
