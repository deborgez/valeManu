-- DropIndex
DROP INDEX "Manutencao_numeroProcesso_key";

-- CreateIndex
CREATE INDEX "Manutencao_numeroProcesso_idx" ON "Manutencao"("numeroProcesso");
