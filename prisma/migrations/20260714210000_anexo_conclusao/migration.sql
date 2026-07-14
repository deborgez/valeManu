-- AlterTable
ALTER TABLE "Anexo" ADD COLUMN     "conclusaoServicoId" TEXT;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_conclusaoServicoId_fkey" FOREIGN KEY ("conclusaoServicoId") REFERENCES "ConclusaoServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

