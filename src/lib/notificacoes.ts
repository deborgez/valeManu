import { prisma } from "@/lib/prisma";

type Perfil = "ADMIN" | "ADMINISTRATIVO" | "VISTORIADOR" | "CORRETOR";

export type CategoriaNotificacao = "DISTRATO" | "MANUTENCAO" | "VISTORIA";

export const LABEL_CATEGORIA: Record<CategoriaNotificacao, string> = {
  DISTRATO: "Distratos",
  MANUTENCAO: "Manutenções",
  VISTORIA: "Vistorias",
};

// Falhas ao notificar nunca devem quebrar a ação principal.
export async function notificar({
  perfis = [],
  usuarios = [],
  excetoUsuarioId,
  categoria,
  mensagem,
  link,
}: {
  perfis?: Perfil[];
  usuarios?: string[];
  excetoUsuarioId?: string;
  categoria: CategoriaNotificacao;
  mensagem: string;
  link?: string;
}) {
  try {
    const usuariosAtivos = await prisma.user.findMany({
      where: {
        OR: [{ role: { in: perfis } }, { id: { in: usuarios } }],
        NOT: { notificacoesDesativadas: { has: categoria } },
      },
      select: { id: true },
    });

    const destinatarios = new Set(usuariosAtivos.map((u) => u.id));
    if (excetoUsuarioId) destinatarios.delete(excetoUsuarioId);
    if (destinatarios.size === 0) return;

    await prisma.notificacao.createMany({
      data: Array.from(destinatarios).map((usuarioId) => ({
        usuarioId,
        mensagem,
        categoria,
        link: link ?? null,
      })),
    });
  } catch (erro) {
    console.error("Falha ao criar notificação:", erro);
  }
}

export const LABEL_SECAO_DISTRATO: Record<string, string> = {
  AVISO_PREVIO: "o Aviso Prévio",
  COMUNICADO: "o Comunicado ao Locador",
  ACOMPANHAMENTO: "o Acompanhamento do Aviso Prévio",
  LOCAL_ENTREGA_CHAVES: "o local da Entrega de Chaves",
  ENTREGA_CHAVES: "a Entrega de Chaves",
  AGENDAMENTO_VISTORIA: "o Agendamento da Vistoria",
  COMUNICADO_VISTORIA: "o Comunicado ao Locador (vistoria)",
  VISTORIA_SAIDA: "a Vistoria de Saída",
  SOLICITACAO_VISTORIA_SAIDA: "a Solicitação da Vistoria de Saída",
  LAUDO_VISTORIA: "a Entrega do Laudo",
  COMUNICADO_ENCERRAMENTO_LOCADOR: "o Comunicado ao Locador (encerramento)",
  COMUNICADO_ENCERRAMENTO_LOCATARIO: "o Comunicado ao Locatário (encerramento)",
  ADEQUACOES: "as Adequações",
  ALUGUEL: "o Aluguel",
  ACORDO: "o Acordo",
  JURIDICO: "o Jurídico",
};
