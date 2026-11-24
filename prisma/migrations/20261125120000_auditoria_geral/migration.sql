-- CreateTable
CREATE TABLE "AuditoriaGeral" (
    "id" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT,
    "referencia" TEXT,
    "acao" TEXT NOT NULL,
    "detalhe" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT,
    "usuarioNome" TEXT NOT NULL,

    CONSTRAINT "AuditoriaGeral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditoriaGeral_entidade_createdAt_idx" ON "AuditoriaGeral"("entidade", "createdAt");
CREATE INDEX "AuditoriaGeral_createdAt_idx" ON "AuditoriaGeral"("createdAt");

-- AddForeignKey
ALTER TABLE "AuditoriaGeral" ADD CONSTRAINT "AuditoriaGeral_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
