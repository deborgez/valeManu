import { prisma } from "@/lib/prisma";
import { notificar } from "@/lib/notificacoes";
import { formatData, hojeSaoPaulo, parseDataLocal } from "@/lib/datahora";
import { diasEntreDatas } from "@/lib/datahora";
import { LABEL_TIPO_VISTORIA, prazoVistoria } from "@/lib/vistorias";

const MILISSEGUNDOS_DIA = 24 * 60 * 60 * 1000;

// Sem rotina em segundo plano: os lembretes são gerados quando alguém abre as telas iniciais.
// O mesmo lembrete não é repetido em menos de 20 horas.
async function lembrar(args: Parameters<typeof notificar>[0]) {
  const recente = new Date(Date.now() - 20 * 60 * 60 * 1000);
  const jaExiste = await prisma.notificacao.findFirst({
    where: { mensagem: args.mensagem, createdAt: { gte: recente } },
    select: { id: true },
  });
  if (!jaExiste) await notificar(args);
}

export async function gerarLembretes() {
  try {
    const hoje = parseDataLocal(hojeSaoPaulo());

    const [vistorias, distratos, pedidos] = await Promise.all([
      prisma.vistoria.findMany({
        where: { status: "PENDENTE" },
        include: { processo: { select: { numeroProcesso: true } } },
      }),
      prisma.distrato.findMany({
        where: { avisoPrevio: { isNot: null }, entregaChaves: null },
        include: {
          avisoPrevio: { select: { data: true } },
          processo: { select: { numeroProcesso: true } },
        },
      }),
      prisma.pedidoOrcamento.findMany({
        where: {
          status: "AGUARDANDO_ENTREGA",
          createdAt: { lte: new Date(Date.now() - 3 * MILISSEGUNDOS_DIA) },
          manutencao: { status: { not: "CANCELADA" } },
        },
        include: {
          prestador: { select: { nome: true } },
          manutencao: { select: { id: true, numeroProcesso: true } },
        },
      }),
    ]);

    for (const v of vistorias) {
      const limite = prazoVistoria(v.createdAt);
      const restantes = diasEntreDatas(limite, hoje);
      const tipo = LABEL_TIPO_VISTORIA[v.tipo].toLowerCase();
      if (restantes < 0) {
        await lembrar({
          perfis: ["ADMIN", "VISTORIADOR"],
          categoria: "VISTORIA",
          mensagem: `Prazo vencido: vistoria de ${tipo} do processo ${v.processo.numeroProcesso} deveria ter sido entregue até ${formatData(limite)}`,
          link: "/vistorias/solicitacoes",
        });
      } else if (restantes <= 1) {
        await lembrar({
          perfis: ["ADMIN", "VISTORIADOR"],
          categoria: "VISTORIA",
          mensagem: `Prazo ${restantes === 0 ? "vence hoje" : "vence amanhã"}: vistoria de ${tipo} do processo ${v.processo.numeroProcesso}`,
          link: "/vistorias/solicitacoes",
        });
      }
    }

    for (const d of distratos) {
      if (!d.avisoPrevio) continue;
      const fim = new Date(d.avisoPrevio.data);
      fim.setDate(fim.getDate() + 30);
      const restantes = diasEntreDatas(fim, hoje);
      if (restantes < 0) {
        await lembrar({
          perfis: ["ADMIN", "ADMINISTRATIVO"],
          categoria: "DISTRATO",
          mensagem: `Distrato ${d.processo.numeroProcesso}: o prazo do aviso prévio venceu em ${formatData(fim)} e as chaves ainda não foram entregues`,
          link: `/distrato/${d.id}`,
        });
      } else if (restantes <= 5) {
        await lembrar({
          perfis: ["ADMIN", "ADMINISTRATIVO"],
          categoria: "DISTRATO",
          mensagem: `Distrato ${d.processo.numeroProcesso}: ${restantes === 0 ? "o prazo do aviso prévio vence hoje" : `faltam ${restantes} ${restantes === 1 ? "dia" : "dias"} para o fim do aviso prévio`} e as chaves ainda não foram entregues`,
          link: `/distrato/${d.id}`,
        });
      }
    }

    for (const p of pedidos) {
      const dias = Math.floor((Date.now() - p.createdAt.getTime()) / MILISSEGUNDOS_DIA);
      await lembrar({
        perfis: ["ADMIN", "ADMINISTRATIVO"],
        categoria: "MANUTENCAO",
        mensagem: `Manutenção ${p.manutencao.numeroProcesso}: o prestador ${p.prestador.nome} ainda não entregou o orçamento (há ${dias} dias)`,
        link: `/manutencoes/${p.manutencao.id}`,
      });
    }
  } catch (erro) {
    console.error("Falha ao gerar lembretes:", erro);
  }
}
