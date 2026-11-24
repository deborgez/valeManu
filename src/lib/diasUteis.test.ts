import { describe, expect, it } from "vitest";
import { adicionarDiasUteis, diasUteisEntre } from "./diasUteis";

const dia = (s: string) => new Date(`${s}T00:00:00-03:00`);
const iso = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

describe("adicionarDiasUteis", () => {
  it("conta 5 dias úteis pulando fim de semana", () => {
    // quarta 14/10/2026 -> quarta 21/10/2026
    expect(iso(adicionarDiasUteis(dia("2026-10-14"), 5))).toBe("2026-10-21");
  });

  it("pula feriado nacional (20/11)", () => {
    expect(iso(adicionarDiasUteis(dia("2026-11-18"), 5))).toBe("2026-11-26");
  });

  it("pula a Sexta-feira Santa", () => {
    // Sexta-feira Santa de 2026: 03/04
    expect(iso(adicionarDiasUteis(dia("2026-04-01"), 5))).toBe("2026-04-09");
  });

  it("pula o Natal", () => {
    expect(iso(adicionarDiasUteis(dia("2026-12-22"), 5))).toBe("2026-12-30");
  });

  it("começando numa sexta, o primeiro dia útil é a segunda", () => {
    expect(iso(adicionarDiasUteis(dia("2026-10-16"), 1))).toBe("2026-10-19");
  });
});

describe("diasUteisEntre", () => {
  it("mesmo dia vale zero", () => {
    expect(diasUteisEntre(dia("2026-10-14"), dia("2026-10-14"))).toBe(0);
  });

  it("conta só dias úteis", () => {
    expect(diasUteisEntre(dia("2026-10-14"), dia("2026-10-21"))).toBe(5);
  });

  it("fim anterior ao início vale zero", () => {
    expect(diasUteisEntre(dia("2026-10-21"), dia("2026-10-14"))).toBe(0);
  });
});
