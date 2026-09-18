-- AlterTable
ALTER TABLE "AcordoDistrato" ADD COLUMN     "tipoMultaAtraso" "TipoDesconto",
ADD COLUMN     "valorMultaAtraso" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ParcelaAcordo" ADD COLUMN     "comprovanteUrl" TEXT,
ADD COLUMN     "comprovanteNome" TEXT,
ADD COLUMN     "comprovanteTipo" TEXT;
