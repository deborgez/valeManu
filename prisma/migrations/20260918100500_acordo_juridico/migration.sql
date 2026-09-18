-- AlterTable
ALTER TABLE "AcordoDistrato" ADD COLUMN     "enviadoJuridico" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataEnvioJuridico" TIMESTAMP(3),
ADD COLUMN     "motivoJuridico" TEXT,
ADD COLUMN     "enviadoJuridicoPorId" TEXT;

-- AddForeignKey
ALTER TABLE "AcordoDistrato" ADD CONSTRAINT "AcordoDistrato_enviadoJuridicoPorId_fkey" FOREIGN KEY ("enviadoJuridicoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
