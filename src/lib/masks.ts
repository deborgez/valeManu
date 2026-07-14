export function formatTelefone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export const PREFIXO_NUMERO_PROCESSO = "IMB.LC.1.";

export function formatNumeroProcesso(value: string): string {
  let semPrefixo: string;

  if (value.startsWith(PREFIXO_NUMERO_PROCESSO)) {
    semPrefixo = value.slice(PREFIXO_NUMERO_PROCESSO.length);
  } else if (PREFIXO_NUMERO_PROCESSO.startsWith(value)) {
    // usuário apagou parte do prefixo fixo; mantém apenas o prefixo
    semPrefixo = "";
  } else {
    semPrefixo = value;
  }

  const digits = semPrefixo.replace(/\D/g, "").slice(0, 9);
  const partes = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 9)].filter(
    Boolean
  );

  return partes.length
    ? `${PREFIXO_NUMERO_PROCESSO}${partes.join(".")}`
    : PREFIXO_NUMERO_PROCESSO;
}

export function formatMoedaDigits(value: string): string {
  const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  const cents = digits.padStart(3, "0");
  const reais = cents.slice(0, -2);
  const centavos = cents.slice(-2);
  const reaisFormatado = reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${reaisFormatado},${centavos}`;
}

export function parseMoeda(value: FormDataEntryValue | null): number {
  if (typeof value !== "string" || value.trim() === "") return 0;

  const normalizado = value.replace(/\./g, "").replace(",", ".");
  const numero = parseFloat(normalizado);

  return Number.isFinite(numero) ? numero : 0;
}

export function formatMoedaExibicao(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0,00";

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
