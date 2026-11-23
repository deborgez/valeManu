-- AlterTable
ALTER TABLE "Vistoria" ADD COLUMN     "distratoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Vistoria_distratoId_key" ON "Vistoria"("distratoId");

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE SET NULL ON UPDATE CASCADE;
