-- AlterTable
ALTER TABLE "ParteProcesso" ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "rg" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Processo" ADD COLUMN     "fiancaCpf" TEXT,
ADD COLUMN     "fiancaRg" TEXT;

