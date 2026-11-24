import ExcelJS from "exceljs";

export function chaveColuna(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function dividirCsv(conteudo: string): string[][] {
  const primeiraLinha = conteudo.split(/\r?\n/, 1)[0] ?? "";
  const separador = (primeiraLinha.match(/;/g)?.length ?? 0) >= (primeiraLinha.match(/,/g)?.length ?? 0) ? ";" : ",";
  const linhas: string[][] = [];
  let campo = "";
  let linha: string[] = [];
  let aspas = false;

  for (let i = 0; i < conteudo.length; i++) {
    const c = conteudo[i];
    if (aspas) {
      if (c === '"' && conteudo[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') {
        aspas = false;
      } else {
        campo += c;
      }
    } else if (c === '"') {
      aspas = true;
    } else if (c === separador) {
      linha.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && conteudo[i + 1] === "\n") i++;
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = "";
    } else {
      campo += c;
    }
  }
  if (campo !== "" || linha.length > 0) {
    linha.push(campo);
    linhas.push(linha);
  }
  return linhas.filter((l) => l.some((v) => v.trim() !== ""));
}

function textoCelula(valor: ExcelJS.CellValue): string {
  if (valor === null || valor === undefined) return "";
  if (valor instanceof Date) {
    return valor.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }
  if (typeof valor === "object") {
    if ("text" in valor && typeof valor.text === "string") return valor.text;
    if ("result" in valor && valor.result !== undefined) return String(valor.result);
    return "";
  }
  return String(valor);
}

// Devolve as linhas como objetos cujas chaves são os cabeçalhos normalizados.
export async function lerPlanilha(arquivo: File): Promise<Record<string, string>[]> {
  const bytes = Buffer.from(await arquivo.arrayBuffer());
  let matriz: string[][];

  if (arquivo.name.toLowerCase().endsWith(".xlsx")) {
    const livro = new ExcelJS.Workbook();
    await livro.xlsx.load(bytes as unknown as ArrayBuffer);
    const aba = livro.worksheets[0];
    if (!aba) return [];
    matriz = [];
    aba.eachRow((linha) => {
      const valores: string[] = [];
      for (let i = 1; i <= aba.columnCount; i++) valores.push(textoCelula(linha.getCell(i).value));
      matriz.push(valores);
    });
  } else {
    matriz = dividirCsv(bytes.toString("utf-8").replace(/^﻿/, ""));
  }

  if (matriz.length < 2) return [];
  const cabecalho = matriz[0].map(chaveColuna);
  return matriz.slice(1).map((linha) => {
    const obj: Record<string, string> = {};
    cabecalho.forEach((chave, i) => {
      if (chave) obj[chave] = (linha[i] ?? "").trim();
    });
    return obj;
  });
}

export function parseNumeroBr(texto: string): number | null {
  if (!texto) return null;
  const limpo = texto.replace(/[^\d.,-]/g, "");
  if (!limpo) return null;
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : null;
}

export function parseDataBr(texto: string): string | null {
  const m = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;
  return null;
}
