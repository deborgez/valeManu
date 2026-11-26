import { prisma } from "@/lib/prisma";
import { formatEndereco } from "@/lib/endereco";
import { formatMoedaExibicao } from "@/lib/masks";

export async function listarProcessosParaVistoria() {
  const processos = await prisma.processo.findMany({
    orderBy: { numeroProcesso: "asc" },
    select: {
      id: true,
      numeroProcesso: true,
      valorAluguel: true,
      rua: true,
      numero: true,
      complemento: true,
      bairro: true,
      cidade: true,
      estado: true,
    },
  });

  return processos.map((p) => ({
    id: p.id,
    numeroProcesso: p.numeroProcesso,
    endereco: formatEndereco(p),
    valor: p.valorAluguel ? formatMoedaExibicao(p.valorAluguel) : null,
  }));
}
