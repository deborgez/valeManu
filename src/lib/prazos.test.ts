import { describe, expect, it } from "vitest";
import { sinalEntregaChaves, sinalLaudo, sinalVistoriaSaida } from "./prazosDistrato";
import { entregueNoPrazo, prazoVistoria, situacaoVistoria } from "./vistorias";
import { classificarSeveridade, diasEmAberto } from "./tempo";

const dia = (s: string) => new Date(`${s}T00:00:00-03:00`);
const iso = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

describe("entrega das chaves x aviso prévio (30 dias)", () => {
  it("dentro do prazo", () => {
    const s = sinalEntregaChaves(dia("2026-10-01"), dia("2026-10-20"));
    expect(s.texto).toContain("Dentro do prazo");
    expect(s.texto).toContain("19 dias");
  });

  it("no último dia ainda é dentro do prazo", () => {
    expect(sinalEntregaChaves(dia("2026-10-01"), dia("2026-10-31")).texto).toContain("Dentro do prazo");
  });

  it("entrega anterior ao aviso é sinalizada, sem números absurdos", () => {
    const s = sinalEntregaChaves(dia("2026-10-10"), dia("2026-10-05"));
    expect(s.texto).toContain("anterior ao aviso prévio");
    expect(s.texto).toContain("5 dias antes");
  });

  it("fora do prazo mostra quantos dias passaram", () => {
    const s = sinalEntregaChaves(dia("2026-10-01"), dia("2026-11-05"));
    expect(s.texto).toContain("Fora do prazo");
    expect(s.texto).toContain("35 dias após o aviso");
    expect(s.texto).toContain("5 dias além");
  });
});

describe("vistoria de saída x data agendada", () => {
  it("na data agendada", () => {
    expect(sinalVistoriaSaida(dia("2026-10-22"), dia("2026-10-22")).texto).toBe("Realizada na data agendada");
  });

  it("depois da data agendada", () => {
    expect(sinalVistoriaSaida(dia("2026-10-22"), dia("2026-10-27")).texto).toBe(
      "Realizada 5 dias depois da data agendada"
    );
  });

  it("antes da data agendada", () => {
    expect(sinalVistoriaSaida(dia("2026-10-22"), dia("2026-10-21")).texto).toBe(
      "Realizada 1 dia antes da data agendada"
    );
  });
});

describe("laudo: 5 dias úteis após a vistoria", () => {
  it("considera o feriado de Finados (02/11)", () => {
    // 27/10 + 5 úteis: 28, 29, 30, (02/11 feriado), 03, 04
    expect(sinalLaudo(dia("2026-10-27"), dia("2026-11-04")).texto).toContain("Entregue no prazo");
  });

  it("atrasado informa os dias de atraso", () => {
    const s = sinalLaudo(dia("2026-10-27"), dia("2026-11-09"));
    expect(s.texto).toContain("fora do prazo");
    expect(s.texto).toContain("5 dias");
  });
});

describe("prazo e situação da vistoria (5 dias úteis da solicitação)", () => {
  it("calcula o prazo a partir da solicitação", () => {
    // 17, 18, 19, (20 é feriado), 23 e 24: o quinto dia útil é terça 24/11
    expect(iso(prazoVistoria(dia("2026-11-16")))).toBe("2026-11-24");
  });

  it("com agendamento, o prazo conta da data agendada", () => {
    // solicitada em 16/11, agendada para 25/11: 26, 27, 30/11, 01 e 02/12
    const v = { createdAt: dia("2026-11-16"), agendadaPara: dia("2026-11-25") };
    expect(iso(prazoVistoria(v))).toBe("2026-12-02");
    expect(iso(prazoVistoria({ createdAt: dia("2026-11-16") }))).toBe("2026-11-24");
  });

  it("vistoria agendada para o futuro aparece como Agendada", () => {
    const v = { createdAt: dia("2026-11-16"), agendadaPara: dia("2026-11-25"), status: "PENDENTE", entregueData: null };
    expect(situacaoVistoria(v, dia("2026-11-20")).rotulo).toBe("Agendada");
    expect(situacaoVistoria(v, dia("2026-11-25")).rotulo).toBe("Pendente");
  });

  it("entregue no limite conta como no prazo", () => {
    const v = { createdAt: dia("2026-11-16"), status: "ENTREGUE", entregueData: dia("2026-11-24") };
    expect(entregueNoPrazo(v)).toBe(true);
  });

  it("entregue depois do limite é fora do prazo", () => {
    const v = { createdAt: dia("2026-11-16"), status: "ENTREGUE", entregueData: dia("2026-11-25") };
    expect(entregueNoPrazo(v)).toBe(false);
  });

  it("pendente não tem resultado de prazo", () => {
    expect(entregueNoPrazo({ createdAt: dia("2026-11-16"), status: "PENDENTE", entregueData: null })).toBeNull();
  });

  it("rótulos da situação", () => {
    const base = { createdAt: dia("2026-11-16") };
    expect(
      situacaoVistoria({ ...base, status: "ENTREGUE", entregueData: dia("2026-11-20") }, dia("2026-11-30")).rotulo
    ).toBe("Entregue no prazo");
    expect(
      situacaoVistoria({ ...base, status: "ENTREGUE", entregueData: dia("2026-11-27") }, dia("2026-11-30")).rotulo
    ).toBe("Entregue com atraso");
    expect(situacaoVistoria({ ...base, status: "PENDENTE", entregueData: null }, dia("2026-11-30")).rotulo).toBe(
      "Prazo vencido"
    );
    expect(situacaoVistoria({ ...base, status: "PENDENTE", entregueData: null }, dia("2026-11-18")).rotulo).toBe(
      "Pendente"
    );
  });
});

describe("tempo em aberto das manutenções", () => {
  it("classifica a severidade", () => {
    expect(classificarSeveridade(0, true)).toBe("verde");
    expect(classificarSeveridade(2, true)).toBe("amarelo");
    expect(classificarSeveridade(3, true)).toBe("vermelho");
    expect(classificarSeveridade(10, false)).toBe("neutro");
  });

  it("desconta os dias em que ficou cancelada", () => {
    const criada = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(diasEmAberto(criada)).toBe(10);
    expect(diasEmAberto(criada, 4)).toBe(6);
    expect(diasEmAberto(criada, 99)).toBe(0);
  });
});
