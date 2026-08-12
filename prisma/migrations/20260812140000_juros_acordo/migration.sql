-- AlterTable
ALTER TABLE "AcordoDistrato" ADD COLUMN     "tipoJuros" "TipoDesconto",
ADD COLUMN     "valorJuros" DOUBLE PRECISION NOT NULL DEFAULT 0;
