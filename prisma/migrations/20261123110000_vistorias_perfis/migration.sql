-- Perfis: USER vira ADMINISTRATIVO; novos perfis VISTORIADOR e CORRETOR
ALTER TYPE "Role" RENAME VALUE 'USER' TO 'ADMINISTRATIVO';
ALTER TYPE "Role" ADD VALUE 'VISTORIADOR';
ALTER TYPE "Role" ADD VALUE 'CORRETOR';
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ADMINISTRATIVO';

-- CreateEnum
CREATE TYPE "TipoVistoria" AS ENUM ('ENTRADA', 'SAIDA');
CREATE TYPE "StatusVistoria" AS ENUM ('PENDENTE', 'ENTREGUE');

-- AlterTable
ALTER TABLE "Processo" ADD COLUMN     "valorAluguel" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Vistoria" (
    "id" TEXT NOT NULL,
    "tipo" "TipoVistoria" NOT NULL,
    "status" "StatusVistoria" NOT NULL DEFAULT 'PENDENTE',
    "comprovanteUrl" TEXT NOT NULL,
    "comprovanteNome" TEXT,
    "comprovanteTipo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entregueData" TIMESTAMP(3),
    "entregueHora" TEXT,
    "processoId" TEXT NOT NULL,
    "solicitadoPorId" TEXT NOT NULL,
    "entreguePorId" TEXT,

    CONSTRAINT "Vistoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vistoria_tipo_status_idx" ON "Vistoria"("tipo", "status");

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "Processo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_solicitadoPorId_fkey" FOREIGN KEY ("solicitadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_entreguePorId_fkey" FOREIGN KEY ("entreguePorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
