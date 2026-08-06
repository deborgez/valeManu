-- CreateEnum
CREATE TYPE "ManutencaoCategoria" AS ENUM ('MANUTENCAO', 'ADEQUACAO');

-- AlterTable
ALTER TABLE "Manutencao" ADD COLUMN     "categoria" "ManutencaoCategoria" NOT NULL DEFAULT 'MANUTENCAO',
ADD COLUMN     "distratoId" TEXT;

-- AlterTable
ALTER TABLE "Distrato" ADD COLUMN     "existemAdequacoes" BOOLEAN;

-- AddForeignKey
ALTER TABLE "Manutencao" ADD CONSTRAINT "Manutencao_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE SET NULL ON UPDATE CASCADE;
