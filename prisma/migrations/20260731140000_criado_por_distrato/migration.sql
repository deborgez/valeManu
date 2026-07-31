-- AlterTable
ALTER TABLE "AgendamentoVistoriaSaida" ADD COLUMN     "criadoPorId" TEXT;

-- AlterTable
ALTER TABLE "AvisoPrevioLocatario" ADD COLUMN     "criadoPorId" TEXT;

-- AlterTable
ALTER TABLE "ComunicadoLocador" ADD COLUMN     "criadoPorId" TEXT;

-- AlterTable
ALTER TABLE "ContatoAcompanhamento" ADD COLUMN     "criadoPorId" TEXT;

-- AlterTable
ALTER TABLE "EntregaChaves" ADD COLUMN     "criadoPorId" TEXT;

-- AlterTable
ALTER TABLE "VistoriaSaida" ADD COLUMN     "criadoPorId" TEXT;

-- AddForeignKey
ALTER TABLE "AvisoPrevioLocatario" ADD CONSTRAINT "AvisoPrevioLocatario_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComunicadoLocador" ADD CONSTRAINT "ComunicadoLocador_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContatoAcompanhamento" ADD CONSTRAINT "ContatoAcompanhamento_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendamentoVistoriaSaida" ADD CONSTRAINT "AgendamentoVistoriaSaida_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntregaChaves" ADD CONSTRAINT "EntregaChaves_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VistoriaSaida" ADD CONSTRAINT "VistoriaSaida_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

