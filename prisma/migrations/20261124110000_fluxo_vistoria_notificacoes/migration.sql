-- AlterTable
ALTER TABLE "Vistoria" ADD COLUMN     "locadorDesejaParticipar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locatarioDesejaParticipar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locadorParticipou" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locatarioParticipou" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "link" TEXT,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notificacao_usuarioId_lida_idx" ON "Notificacao"("usuarioId", "lida");

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
