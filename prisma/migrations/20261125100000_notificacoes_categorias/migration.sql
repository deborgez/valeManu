-- AlterTable
ALTER TABLE "Notificacao" ADD COLUMN     "categoria" TEXT NOT NULL DEFAULT 'GERAL';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notificacoesDesativadas" TEXT[] DEFAULT ARRAY[]::TEXT[];
