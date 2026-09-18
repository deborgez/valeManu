-- CreateTable
CREATE TABLE "CobrancaParcela" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "forma" "FormaContato" NOT NULL,
    "anotacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parcelaId" TEXT NOT NULL,
    "criadoPorId" TEXT,

    CONSTRAINT "CobrancaParcela_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CobrancaParcela" ADD CONSTRAINT "CobrancaParcela_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "ParcelaAcordo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobrancaParcela" ADD CONSTRAINT "CobrancaParcela_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
