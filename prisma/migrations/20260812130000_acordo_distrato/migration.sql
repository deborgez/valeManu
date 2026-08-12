-- CreateEnum
CREATE TYPE "TipoDesconto" AS ENUM ('PERCENTUAL', 'VALOR');

-- CreateTable
CREATE TABLE "AcordoDistrato" (
    "id" TEXT NOT NULL,
    "valorOriginal" DOUBLE PRECISION NOT NULL,
    "tipoDesconto" "TipoDesconto",
    "valorDesconto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorFinal" DOUBLE PRECISION NOT NULL,
    "numeroParcelas" INTEGER NOT NULL,
    "primeiraParcela" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,
    "criadoPorId" TEXT,

    CONSTRAINT "AcordoDistrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParcelaAcordo" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "dataPagamento" TIMESTAMP(3),
    "acordoId" TEXT NOT NULL,

    CONSTRAINT "ParcelaAcordo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcordoDistrato_distratoId_key" ON "AcordoDistrato"("distratoId");

-- AddForeignKey
ALTER TABLE "AcordoDistrato" ADD CONSTRAINT "AcordoDistrato_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcordoDistrato" ADD CONSTRAINT "AcordoDistrato_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelaAcordo" ADD CONSTRAINT "ParcelaAcordo_acordoId_fkey" FOREIGN KEY ("acordoId") REFERENCES "AcordoDistrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
