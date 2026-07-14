import { prisma } from "@/lib/prisma";

/**
 * Verifica serviços agendados cujo horário já chegou e os move para
 * "iniciado - em andamento". Chamado ao carregar as telas de manutenções,
 * já que não há job em background.
 */
export async function atualizarServicosAgendados() {
  const agora = new Date();

  const agendadosVencidos = await prisma.inicioServico.findMany({
    where: {
      status: "AGENDADO",
      dataHoraAgendada: { lte: agora },
    },
  });

  for (const inicio of agendadosVencidos) {
    await prisma.$transaction([
      prisma.inicioServico.update({
        where: { id: inicio.id },
        data: { status: "INICIADO_ANDAMENTO" },
      }),
      prisma.manutencao.update({
        where: { id: inicio.manutencaoId },
        data: { status: "EM_ANDAMENTO" },
      }),
    ]);
  }
}
