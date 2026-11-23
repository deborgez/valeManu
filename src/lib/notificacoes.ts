import { prisma } from "@/lib/prisma";

type Perfil = "ADMIN" | "ADMINISTRATIVO" | "VISTORIADOR" | "CORRETOR";

// Falhas ao notificar nunca devem quebrar a ação principal.
export async function notificar({
  perfis = [],
  usuarios = [],
  excetoUsuarioId,
  mensagem,
  link,
}: {
  perfis?: Perfil[];
  usuarios?: string[];
  excetoUsuarioId?: string;
  mensagem: string;
  link?: string;
}) {
  try {
    const porPerfil = perfis.length
      ? await prisma.user.findMany({
          where: { role: { in: perfis } },
          select: { id: true },
        })
      : [];

    const destinatarios = new Set([...porPerfil.map((u) => u.id), ...usuarios]);
    if (excetoUsuarioId) destinatarios.delete(excetoUsuarioId);
    if (destinatarios.size === 0) return;

    await prisma.notificacao.createMany({
      data: Array.from(destinatarios).map((usuarioId) => ({
        usuarioId,
        mensagem,
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
