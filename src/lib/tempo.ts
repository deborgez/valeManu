export function diasEmAberto(createdAt: Date): number {
  const ms = Date.now() - createdAt.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export type Severidade = "neutro" | "verde" | "amarelo" | "vermelho";

export function classificarSeveridade(dias: number, aberta: boolean): Severidade {
  if (!aberta) return "neutro";
  if (dias >= 3) return "vermelho";
  if (dias >= 2) return "amarelo";
  return "verde";
}
