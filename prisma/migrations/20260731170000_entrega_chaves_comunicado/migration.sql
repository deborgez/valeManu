-- CreateEnum
CREATE TYPE "LocalEntrega" AS ENUM ('IMOVEL', 'IMOBILIARIA');

-- AlterTable
ALTER TABLE "EntregaChaves" DROP COLUMN "informeArquivoNome",
DROP COLUMN "informeArquivoTipo",
DROP COLUMN "informeArquivoUrl",
DROP COLUMN "informeData",
ADD COLUMN     "hora" TEXT,
ADD COLUMN     "local" "LocalEntrega",
ADD COLUMN     "proprietarioPresenciou" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ComunicadoEntregaChaves" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3),
    "forma" "FormaContato",
    "proprietarioPresenciou" BOOLEAN NOT NULL DEFAULT false,
    "arquivoUrl" TEXT,
    "arquivoNome" TEXT,
    "arquivoTipo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,
    "criadoPorId" TEXT,

    CONSTRAINT "ComunicadoEntregaChaves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComunicadoEntregaChaves_distratoId_key" ON "ComunicadoEntregaChaves"("distratoId");

-- AddForeignKey
ALTER TABLE "ComunicadoEntregaChaves" ADD CONSTRAINT "ComunicadoEntregaChaves_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComunicadoEntregaChaves" ADD CONSTRAINT "ComunicadoEntregaChaves_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

