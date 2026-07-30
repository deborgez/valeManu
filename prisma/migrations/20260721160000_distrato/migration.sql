-- CreateEnum
CREATE TYPE "FormaAviso" AS ENUM ('EMAIL', 'WHATSAPP', 'TERMO');

-- CreateEnum
CREATE TYPE "FormaContato" AS ENUM ('LIGACAO', 'WHATSAPP');

-- CreateTable
CREATE TABLE "Distrato" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processoId" TEXT NOT NULL,
    "criadoPorId" TEXT NOT NULL,

    CONSTRAINT "Distrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvisoPrevioLocatario" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "forma" "FormaAviso" NOT NULL,
    "arquivoUrl" TEXT,
    "arquivoNome" TEXT,
    "arquivoTipo" TEXT,
    "diasForaPrazo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,

    CONSTRAINT "AvisoPrevioLocatario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComunicadoLocador" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "forma" "FormaAviso" NOT NULL,
    "arquivoUrl" TEXT,
    "arquivoNome" TEXT,
    "arquivoTipo" TEXT,
    "diasForaPrazo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,

    CONSTRAINT "ComunicadoLocador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContatoAcompanhamento" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forma" "FormaContato" NOT NULL,
    "arquivoUrl" TEXT,
    "arquivoNome" TEXT,
    "arquivoTipo" TEXT,
    "dataPrevistaEntregaChaves" TIMESTAMP(3),
    "dataPrevistaVistoriaSaida" TIMESTAMP(3),
    "distratoId" TEXT NOT NULL,

    CONSTRAINT "ContatoAcompanhamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgendamentoVistoriaSaida" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "comunicacaoData" TIMESTAMP(3),
    "comunicacaoArquivoUrl" TEXT,
    "comunicacaoArquivoNome" TEXT,
    "comunicacaoArquivoTipo" TEXT,
    "locadorNaoQuerParticipar" BOOLEAN NOT NULL DEFAULT false,
    "naoParticiparArquivoUrl" TEXT,
    "naoParticiparArquivoNome" TEXT,
    "naoParticiparArquivoTipo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,

    CONSTRAINT "AgendamentoVistoriaSaida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntregaChaves" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "termoUrl" TEXT,
    "termoNome" TEXT,
    "termoTipo" TEXT,
    "informeData" TIMESTAMP(3),
    "informeArquivoUrl" TEXT,
    "informeArquivoNome" TEXT,
    "informeArquivoTipo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,

    CONSTRAINT "EntregaChaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VistoriaSaida" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "arquivoUrl" TEXT,
    "arquivoNome" TEXT,
    "arquivoTipo" TEXT,
    "locadorCompareceu" BOOLEAN,
    "locatarioParticipou" BOOLEAN,
    "informeData" TIMESTAMP(3),
    "informeArquivoUrl" TEXT,
    "informeArquivoNome" TEXT,
    "informeArquivoTipo" TEXT,
    "dataEntregaLaudo" TIMESTAMP(3),
    "laudoArquivoUrl" TEXT,
    "laudoArquivoNome" TEXT,
    "laudoArquivoTipo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,

    CONSTRAINT "VistoriaSaida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AvisoPrevioLocatario_distratoId_key" ON "AvisoPrevioLocatario"("distratoId");

-- CreateIndex
CREATE UNIQUE INDEX "ComunicadoLocador_distratoId_key" ON "ComunicadoLocador"("distratoId");

-- CreateIndex
CREATE UNIQUE INDEX "AgendamentoVistoriaSaida_distratoId_key" ON "AgendamentoVistoriaSaida"("distratoId");

-- CreateIndex
CREATE UNIQUE INDEX "EntregaChaves_distratoId_key" ON "EntregaChaves"("distratoId");

-- CreateIndex
CREATE UNIQUE INDEX "VistoriaSaida_distratoId_key" ON "VistoriaSaida"("distratoId");

-- AddForeignKey
ALTER TABLE "Distrato" ADD CONSTRAINT "Distrato_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "Processo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distrato" ADD CONSTRAINT "Distrato_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvisoPrevioLocatario" ADD CONSTRAINT "AvisoPrevioLocatario_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComunicadoLocador" ADD CONSTRAINT "ComunicadoLocador_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContatoAcompanhamento" ADD CONSTRAINT "ContatoAcompanhamento_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendamentoVistoriaSaida" ADD CONSTRAINT "AgendamentoVistoriaSaida_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntregaChaves" ADD CONSTRAINT "EntregaChaves_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VistoriaSaida" ADD CONSTRAINT "VistoriaSaida_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

