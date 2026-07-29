-- AlterTable
ALTER TABLE "ConclusaoServico" ADD COLUMN     "inicioServicoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ConclusaoServico_inicioServicoId_key" ON "ConclusaoServico"("inicioServicoId");

-- AddForeignKey
ALTER TABLE "ConclusaoServico" ADD CONSTRAINT "ConclusaoServico_inicioServicoId_fkey" FOREIGN KEY ("inicioServicoId") REFERENCES "InicioServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

