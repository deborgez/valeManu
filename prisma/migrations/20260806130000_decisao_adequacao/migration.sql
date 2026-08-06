-- CreateTable
CREATE TABLE "DecisaoAdequacao" (
    "id" TEXT NOT NULL,
    "existemAdequacoes" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,
    "criadoPorId" TEXT,

    CONSTRAINT "DecisaoAdequacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DecisaoAdequacao_distratoId_key" ON "DecisaoAdequacao"("distratoId");

-- Backfill from the previous plain boolean column on Distrato
INSERT INTO "DecisaoAdequacao" ("id", "existemAdequacoes", "createdAt", "distratoId")
SELECT gen_random_uuid()::text, "existemAdequacoes", CURRENT_TIMESTAMP, "id"
FROM "Distrato"
WHERE "existemAdequacoes" IS NOT NULL;

-- AlterTable
ALTER TABLE "Distrato" DROP COLUMN "existemAdequacoes";

-- AddForeignKey
ALTER TABLE "DecisaoAdequacao" ADD CONSTRAINT "DecisaoAdequacao_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisaoAdequacao" ADD CONSTRAINT "DecisaoAdequacao_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
