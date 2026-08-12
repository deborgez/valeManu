-- CreateEnum
CREATE TYPE "SubtipoLancamento" AS ENUM ('CONTA', 'SERVICO');

-- AlterTable
ALTER TABLE "LancamentoFinanceiro" ADD COLUMN     "subtipo" "SubtipoLancamento",
ADD COLUMN     "nomeServico" TEXT;
