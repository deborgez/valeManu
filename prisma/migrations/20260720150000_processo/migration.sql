-- CreateEnum
CREATE TYPE "TipoFianca" AS ENUM ('FIADOR', 'SEGURO_FIANCA', 'FIANCA_ONEROSA');

-- CreateTable
CREATE TABLE "Processo" (
    "id" TEXT NOT NULL,
    "numeroProcesso" TEXT NOT NULL,
    "locadorNome" TEXT NOT NULL,
    "locadorTelefone" TEXT NOT NULL,
    "locatarioNome" TEXT NOT NULL,
    "locatarioTelefone" TEXT NOT NULL,
    "tipoFianca" "TipoFianca" NOT NULL,
    "fiancaNome" TEXT NOT NULL,
    "fiancaTelefone" TEXT,
    "cep" TEXT,
    "rua" TEXT NOT NULL,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "criadoPorId" TEXT NOT NULL,

    CONSTRAINT "Processo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Processo_numeroProcesso_key" ON "Processo"("numeroProcesso");

-- AddForeignKey
ALTER TABLE "Processo" ADD CONSTRAINT "Processo_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

