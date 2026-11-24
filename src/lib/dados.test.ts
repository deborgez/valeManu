import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { especialidadeCanonica } from "./especialidades";
import { lerPlanilha, parseDataBr, parseNumeroBr } from "./planilha";
import { formatNumeroProcesso, parseMoeda } from "./masks";

describe("especialidades", () => {
  it("unifica variações com a lista oficial", () => {
    expect(especialidadeCanonica("Pintor")).toBe("Pintura");
    expect(especialidadeCanonica("Pinturas e Reparos")).toBe("Pintura");
    expect(especialidadeCanonica("Encanador")).toBe("Hidráulica");
    expect(especialidadeCanonica("Poço Artesiano")).toBe("Hidráulica");
    expect(especialidadeCanonica("Segurança Eletrônica / Portão Eletrônico")).toBe("Segurança Eletrônica");
    expect(especialidadeCanonica("Serviços Gerais")).toBe("Pequenos Reparos (Marido de Aluguel)");
  });

  it("carpinteiro não vira pintura", () => {
    expect(especialidadeCanonica("Carpinteiro")).toBe("Marcenaria e Carpintaria");
    expect(especialidadeCanonica("Marceneiro")).toBe("Marcenaria e Carpintaria");
  });

  it("mantém o que não reconhece", () => {
    expect(especialidadeCanonica("Garagem")).toBe("Garagem");
  });
});

describe("leitura de planilhas", () => {
  it("lê CSV com ponto e vírgula e aspas", async () => {
    const csv = new File(
      ['Nome;Especialidade;Telefone\r\nJoão;Hidráulica;(16) 99999-0000\r\n"Maria; Silva";Pintura;(16) 98888-1111\r\n'],
      "t.csv"
    );
    const linhas = await lerPlanilha(csv);
    expect(linhas).toHaveLength(2);
    expect(linhas[0]).toEqual({ nome: "João", especialidade: "Hidráulica", telefone: "(16) 99999-0000" });
    expect(linhas[1].nome).toBe("Maria; Silva");
  });

  it("lê XLSX e normaliza os cabeçalhos", async () => {
    const livro = new ExcelJS.Workbook();
    const aba = livro.addWorksheet("A");
    aba.addRow(["Processo", "Início do contrato", "Valor do aluguel"]);
    aba.addRow(["IMB.LC.1.26.01.00001", new Date(Date.UTC(2026, 0, 10)), 1500]);
    const buffer = Buffer.from(await livro.xlsx.writeBuffer());
    const linhas = await lerPlanilha(new File([buffer], "t.xlsx"));
    expect(linhas[0].processo).toBe("IMB.LC.1.26.01.00001");
    expect(linhas[0].iniciodocontrato).toBe("10/01/2026");
    expect(linhas[0].valordoaluguel).toBe("1500");
  });

  it("converte números e datas no padrão brasileiro", () => {
    expect(parseNumeroBr("1.500,00")).toBe(1500);
    expect(parseNumeroBr("945,5")).toBe(945.5);
    expect(parseNumeroBr("")).toBeNull();
    expect(parseDataBr("10/1/2026")).toBe("2026-01-10");
    expect(parseDataBr("texto")).toBeNull();
  });
});

describe("máscaras", () => {
  it("número do processo mantém o prefixo e agrupa os dígitos", () => {
    expect(formatNumeroProcesso("IMB.LC.1.")).toBe("IMB.LC.1.");
    expect(formatNumeroProcesso("IMB.LC.1.2601")).toBe("IMB.LC.1.26.01");
    expect(formatNumeroProcesso("IMB.LC.1.260100003")).toBe("IMB.LC.1.26.01.00003");
  });

  it("permite apagar ou trocar o prefixo", () => {
    expect(formatNumeroProcesso("imb.lc.2.25")).toBe("IMB.LC.2.25");
    expect(formatNumeroProcesso("IMB.LC")).toBe("IMB.LC");
  });

  it("converte valores monetários", () => {
    expect(parseMoeda("1.234,56")).toBe(1234.56);
    expect(parseMoeda("")).toBe(0);
    expect(parseMoeda(null)).toBe(0);
  });
});
