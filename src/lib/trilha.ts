export const ETAPAS_TRILHA = [
  "Solicitação",
  "Pedido de Orçamento",
  "Entrega de Orçamento",
  "Aprovação do Serviço",
  "Início do Serviço",
  "Conclusão do Serviço",
] as const;

export function etapaAtualIndex(
  status: string,
  temPedidos: boolean
): number {
  switch (status) {
    case "SOLICITACAO":
      return 0;
    case "AGUARDANDO_ORCAMENTO":
      return temPedidos ? 2 : 1;
    case "AGUARDANDO_APROVACAO":
      return 3;
    case "APROVADA":
    case "AGENDADA":
    case "EM_ANDAMENTO":
      return 4;
    case "CONCLUIDA":
      return 5;
    default:
      return 0;
  }
}
