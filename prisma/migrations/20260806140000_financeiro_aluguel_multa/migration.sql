-- AlterTable
ALTER TABLE "Processo" ADD COLUMN     "prazoMultaMeses" INTEGER;

-- CreateTable
CREATE TABLE "AluguelDistrato" (
    "id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,
    "criadoPorId" TEXT,

    CONSTRAINT "AluguelDistrato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AluguelDistrato_distratoId_key" ON "AluguelDistrato"("distratoId");

-- AddForeignKey
ALTER TABLE "AluguelDistrato" ADD CONSTRAINT "AluguelDistrato_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AluguelDistrato" ADD CONSTRAINT "AluguelDistrato_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
