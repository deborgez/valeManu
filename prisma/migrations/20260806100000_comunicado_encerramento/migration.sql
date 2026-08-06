-- CreateTable
CREATE TABLE "ComunicadoEncerramentoLocador" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "forma" "FormaAviso" NOT NULL,
    "arquivoUrl" TEXT,
    "arquivoNome" TEXT,
    "arquivoTipo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,
    "criadoPorId" TEXT,

    CONSTRAINT "ComunicadoEncerramentoLocador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComunicadoEncerramentoLocatario" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "forma" "FormaAviso" NOT NULL,
    "arquivoUrl" TEXT,
    "arquivoNome" TEXT,
    "arquivoTipo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,
    "criadoPorId" TEXT,

    CONSTRAINT "ComunicadoEncerramentoLocatario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComunicadoEncerramentoLocador_distratoId_key" ON "ComunicadoEncerramentoLocador"("distratoId");

-- CreateIndex
CREATE UNIQUE INDEX "ComunicadoEncerramentoLocatario_distratoId_key" ON "ComunicadoEncerramentoLocatario"("distratoId");

-- AddForeignKey
ALTER TABLE "ComunicadoEncerramentoLocador" ADD CONSTRAINT "ComunicadoEncerramentoLocador_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComunicadoEncerramentoLocador" ADD CONSTRAINT "ComunicadoEncerramentoLocador_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComunicadoEncerramentoLocatario" ADD CONSTRAINT "ComunicadoEncerramentoLocatario_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComunicadoEncerramentoLocatario" ADD CONSTRAINT "ComunicadoEncerramentoLocatario_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
