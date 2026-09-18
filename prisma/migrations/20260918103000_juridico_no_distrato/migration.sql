-- AlterTable: mover o envio ao Jurídico do Acordo pro Distrato (independe de existir acordo)
ALTER TABLE "Distrato" ADD COLUMN     "enviadoJuridico" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataEnvioJuridico" TIMESTAMP(3),
ADD COLUMN     "motivoJuridico" TEXT,
ADD COLUMN     "enviadoJuridicoPorId" TEXT;

-- AddForeignKey
ALTER TABLE "Distrato" ADD CONSTRAINT "Distrato_enviadoJuridicoPorId_fkey" FOREIGN KEY ("enviadoJuridicoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migra dados existentes de AcordoDistrato pra Distrato, se houver
UPDATE "Distrato" d
SET "enviadoJuridico" = a."enviadoJuridico",
    "dataEnvioJuridico" = a."dataEnvioJuridico",
    "motivoJuridico" = a."motivoJuridico",
    "enviadoJuridicoPorId" = a."enviadoJuridicoPorId"
FROM "AcordoDistrato" a
WHERE a."distratoId" = d."id" AND a."enviadoJuridico" = true;

-- DropForeignKey
ALTER TABLE "AcordoDistrato" DROP CONSTRAINT "AcordoDistrato_enviadoJuridicoPorId_fkey";

-- AlterTable
ALTER TABLE "AcordoDistrato" DROP COLUMN "enviadoJuridico",
DROP COLUMN "dataEnvioJuridico",
DROP COLUMN "motivoJuridico",
DROP COLUMN "enviadoJuridicoPorId";
