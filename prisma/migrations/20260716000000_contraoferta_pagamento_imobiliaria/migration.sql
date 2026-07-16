-- CreateEnum
CREATE TYPE "PagamentoStatus" AS ENUM ('PENDENTE', 'PAGO');

-- AlterEnum
ALTER TYPE "ParteInteressada" ADD VALUE 'IMOBILIARIA';

-- AlterEnum
ALTER TYPE "PedidoOrcamentoStatus" ADD VALUE 'CONTRAOFERTA_ENVIADA';

-- AlterTable
ALTER TABLE "PedidoOrcamento" ADD COLUMN     "contraOfertaObservacao" TEXT,
ADD COLUMN     "contraOfertaRecusada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contraOfertaValorMaoDeObra" DOUBLE PRECISION,
ADD COLUMN     "contraOfertaValorMaterial" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "status" "PagamentoStatus" NOT NULL DEFAULT 'PENDENTE',
    "valor" DOUBLE PRECISION,
    "dataPagamento" TIMESTAMP(3),
    "comprovanteUrl" TEXT,
    "comprovanteNome" TEXT,
    "comprovanteTipo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "manutencaoId" TEXT NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

