-- AlterEnum
ALTER TYPE "ManutencaoStatus" ADD VALUE 'CANCELADA';

-- AlterTable
ALTER TABLE "Manutencao" ADD COLUMN     "canceladaEm" TIMESTAMP(3),
ADD COLUMN     "diasPausados" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "statusAntesCancelamento" "ManutencaoStatus";
