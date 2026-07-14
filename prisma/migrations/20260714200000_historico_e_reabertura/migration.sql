-- DropIndex
DROP INDEX "ConclusaoServico_manutencaoId_key";

-- DropIndex
DROP INDEX "InicioServico_manutencaoId_key";

-- CreateTable
CREATE TABLE "HistoricoEtapa" (
    "id" TEXT NOT NULL,
    "etapa" TEXT NOT NULL,
    "detalhe" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "manutencaoId" TEXT NOT NULL,

    CONSTRAINT "HistoricoEtapa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HistoricoEtapa" ADD CONSTRAINT "HistoricoEtapa_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

