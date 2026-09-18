-- CreateEnum
CREATE TYPE "FaseJuridica" AS ENUM ('ANALISE', 'TRATATIVAS', 'NOTIFICACOES', 'EXECUCAO');

-- CreateEnum
CREATE TYPE "ParteJuridica" AS ENUM ('LOCADOR', 'LOCATARIO', 'FIADOR');

-- CreateEnum
CREATE TYPE "MeioNotificacao" AS ENUM ('AR', 'CARTORIO', 'WHATSAPP', 'EMAIL', 'OUTRO');

-- AlterTable
ALTER TABLE "Distrato" ADD COLUMN     "faseJuridica" "FaseJuridica" NOT NULL DEFAULT 'ANALISE';

-- CreateTable
CREATE TABLE "TratativaJuridica" (
    "id" TEXT NOT NULL,
    "parte" "ParteJuridica" NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "arquivoUrl" TEXT,
    "arquivoNome" TEXT,
    "arquivoTipo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,
    "criadoPorId" TEXT,

    CONSTRAINT "TratativaJuridica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificacaoJuridica" (
    "id" TEXT NOT NULL,
    "parte" "ParteJuridica" NOT NULL,
    "meio" "MeioNotificacao" NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "arquivoUrl" TEXT,
    "arquivoNome" TEXT,
    "arquivoTipo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distratoId" TEXT NOT NULL,
    "criadoPorId" TEXT,

    CONSTRAINT "NotificacaoJuridica_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TratativaJuridica" ADD CONSTRAINT "TratativaJuridica_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TratativaJuridica" ADD CONSTRAINT "TratativaJuridica_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoJuridica" ADD CONSTRAINT "NotificacaoJuridica_distratoId_fkey" FOREIGN KEY ("distratoId") REFERENCES "Distrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoJuridica" ADD CONSTRAINT "NotificacaoJuridica_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
