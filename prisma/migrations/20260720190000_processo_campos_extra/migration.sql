-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoFianca" ADD VALUE 'TITULO_CAPITALIZACAO';
ALTER TYPE "TipoFianca" ADD VALUE 'CAUCAO_IMOBILIARIA';
ALTER TYPE "TipoFianca" ADD VALUE 'CAUCAO_DINHEIRO';
ALTER TYPE "TipoFianca" ADD VALUE 'SEM_GARANTIA';

-- AlterTable
ALTER TABLE "Processo" ADD COLUMN     "captador" TEXT,
ADD COLUMN     "codigoImovel" TEXT,
ADD COLUMN     "unidade" TEXT;

