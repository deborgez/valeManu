-- CreateTable
CREATE TABLE "ComunicadoVistoriaSaida" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3),
    "hora" TEXT,
    "locadorNaoQuerParticipar" BOOLEAN NOT NULL DEFAULT false,
    "arquivoUrl" TEXT,
    "arquivoNome" TEXT,
    "arquivoTipo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,
    "criadoPorId" TEXT,

    CONSTRAINT "ComunicadoVistoriaSaida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComunicadoVistoriaSaida_distratoId_key" ON "ComunicadoVistoriaSaida"("distratoId");

-- AddForeignKey
ALTER TABLE "ComunicadoVistoriaSaida" ADD CONSTRAINT "ComunicadoVistoriaSaida_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComunicadoVistoriaSaida" ADD CONSTRAINT "ComunicadoVistoriaSaida_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate existing "comunicação ao proprietário" / "locador não quer participar" data
-- out of AgendamentoVistoriaSaida into the new ComunicadoVistoriaSaida table before
-- dropping the old columns, so no data already entered in production is lost.
INSERT INTO "ComunicadoVistoriaSaida" (
    "id", "data", "locadorNaoQuerParticipar",
    "arquivoUrl", "arquivoNome", "arquivoTipo",
    "createdAt", "distratoId", "criadoPorId"
)
SELECT
    gen_random_uuid()::text,
    "comunicacaoData",
    "locadorNaoQuerParticipar",
    COALESCE("comunicacaoArquivoUrl", "naoParticiparArquivoUrl"),
    COALESCE("comunicacaoArquivoNome", "naoParticiparArquivoNome"),
    COALESCE("comunicacaoArquivoTipo", "naoParticiparArquivoTipo"),
    "createdAt",
    "distratoId",
    "criadoPorId"
FROM "AgendamentoVistoriaSaida"
WHERE "comunicacaoData" IS NOT NULL
   OR "locadorNaoQuerParticipar" = true
   OR "comunicacaoArquivoUrl" IS NOT NULL
   OR "naoParticiparArquivoUrl" IS NOT NULL;

-- AlterTable
ALTER TABLE "AgendamentoVistoriaSaida" DROP COLUMN "comunicacaoArquivoNome",
DROP COLUMN "comunicacaoArquivoTipo",
DROP COLUMN "comunicacaoArquivoUrl",
DROP COLUMN "comunicacaoData",
DROP COLUMN "locadorNaoQuerParticipar",
DROP COLUMN "naoParticiparArquivoNome",
DROP COLUMN "naoParticiparArquivoTipo",
DROP COLUMN "naoParticiparArquivoUrl",
ADD COLUMN     "arquivoNome" TEXT,
ADD COLUMN     "arquivoTipo" TEXT,
ADD COLUMN     "arquivoUrl" TEXT,
ADD COLUMN     "hora" TEXT;
