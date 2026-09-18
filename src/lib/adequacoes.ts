export function valoresAdequacao(a: {
  pedidosOrcamento: {
    status: string;
    valorMaoDeObra: number | null;
    valorMaterial: number | null;
    percentualAdministracao: number;
  }[];
  pagamentos: { valor: number | null }[];
}): { valorPrestador: number | null; valorAdministracao: number } {
  const pedidoAprovado = a.pedidosOrcamento.find((p) => p.status === "APROVADO");
  const valorPrestador =
    a.pagamentos[0]?.valor ??
    (pedidoAprovado
      ? (pedidoAprovado.valorMaoDeObra ?? 0) + (pedidoAprovado.valorMaterial ?? 0)
      : null);
  const valorAdministracao =
    valorPrestador !== null && pedidoAprovado
      ? valorPrestador * (pedidoAprovado.percentualAdministracao / 100)
      : 0;

  return { valorPrestador, valorAdministracao };
}
