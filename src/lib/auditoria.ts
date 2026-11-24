import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type EntidadeAuditoria =
  | "PROCESSO"
  | "PRESTADOR"
  | "USUARIO"
  | "VISTORIA"
  | "MANUTENCAO"
  | "SISTEMA";

export const LABEL_ENTIDADE: Record<EntidadeAuditoria, string> = {
  PROCESSO: "Processo",
  PRESTADOR: "Prestador",
  USUARIO: "Usuário",
  VISTORIA: "Vistoria",
  MANUTENCAO: "Manutenção",
  SISTEMA: "Sistema",
};

// O registro nunca deve impedir a ação principal: falhas só vão para o log do servidor.
export async function registrarAuditoria({
  entidade,
  entidadeId,
  referencia,
  acao,
  detalhe,
}: {
  entidade: EntidadeAuditoria;
  entidadeId?: string | null;
  referencia?: string | null;
  acao: string;
  detalhe?: string | null;
}) {
  try {
    const session = await auth();
    if (!session) return;
    await prisma.auditoriaGeral.create({
      data: {
        entidade,
        entidadeId: entidadeId ?? null,
        referencia: referencia ?? null,
        acao,
        detalhe: detalhe ?? null,
        usuarioId: session.user.id,
        usuarioNome: session.user.name ?? "Usuário",
      },
    });
  } catch (erro) {
    console.error("Falha ao registrar auditoria:", erro);
  }
}
