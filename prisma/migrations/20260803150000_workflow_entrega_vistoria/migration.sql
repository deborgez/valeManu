-- AlterTable: add the local decision to Distrato first, so we can backfill it
-- from the data that is about to be restructured below.
ALTER TABLE "Distrato" ADD COLUMN     "localEntregaChaves" "LocalEntrega";

-- Backfill: distratos that already have an EntregaChaves record inherit its local.
UPDATE "Distrato" d
SET "localEntregaChaves" = ec."local"
FROM "EntregaChaves" ec
WHERE ec."distratoId" = d.id AND ec."local" IS NOT NULL;

-- Backfill: distratos with an Agendamento de Vistoria only ever existed on the
-- "Imobiliária" branch (Agendamento never applied to the "Imóvel" branch), so
-- infer that branch for any distrato that has one but no local set yet.
UPDATE "Distrato" d
SET "localEntregaChaves" = 'IMOBILIARIA'
FROM "AgendamentoVistoriaSaida" a
WHERE a."distratoId" = d.id AND d."localEntregaChaves" IS NULL;

-- AlterTable: rename locadorNaoQuerParticipar -> locadorDesejaParticipar (inverted sense)
ALTER TABLE "ComunicadoVistoriaSaida" ADD COLUMN "locadorDesejaParticipar" BOOLEAN NOT NULL DEFAULT false;
UPDATE "ComunicadoVistoriaSaida" SET "locadorDesejaParticipar" = NOT "locadorNaoQuerParticipar";
ALTER TABLE "ComunicadoVistoriaSaida" DROP COLUMN "locadorNaoQuerParticipar";

-- AlterTable
ALTER TABLE "EntregaChaves" DROP COLUMN "local",
DROP COLUMN "proprietarioPresenciou";

-- AlterTable
ALTER TABLE "VistoriaSaida" DROP COLUMN "dataEntregaLaudo",
DROP COLUMN "informeArquivoNome",
DROP COLUMN "informeArquivoTipo",
DROP COLUMN "informeArquivoUrl",
DROP COLUMN "informeData",
DROP COLUMN "laudoArquivoNome",
DROP COLUMN "laudoArquivoTipo",
DROP COLUMN "laudoArquivoUrl",
DROP COLUMN "locatarioParticipou",
ADD COLUMN     "hora" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "responsavel" TEXT;

-- DropForeignKey
ALTER TABLE "ComunicadoEntregaChaves" DROP CONSTRAINT "ComunicadoEntregaChaves_criadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "ComunicadoEntregaChaves" DROP CONSTRAINT "ComunicadoEntregaChaves_distratoId_fkey";

-- DropTable
DROP TABLE "ComunicadoEntregaChaves";

-- CreateTable
CREATE TABLE "FotosVistoria" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,
    "criadoPorId" TEXT,

    CONSTRAINT "FotosVistoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaudoVistoria" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "arquivoUrl" TEXT,
    "arquivoNome" TEXT,
    "arquivoTipo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,
    "criadoPorId" TEXT,

    CONSTRAINT "LaudoVistoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FotosVistoria_distratoId_key" ON "FotosVistoria"("distratoId");

-- CreateIndex
CREATE UNIQUE INDEX "LaudoVistoria_distratoId_key" ON "LaudoVistoria"("distratoId");

-- AddForeignKey
ALTER TABLE "FotosVistoria" ADD CONSTRAINT "FotosVistoria_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotosVistoria" ADD CONSTRAINT "FotosVistoria_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaudoVistoria" ADD CONSTRAINT "LaudoVistoria_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaudoVistoria" ADD CONSTRAINT "LaudoVistoria_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
