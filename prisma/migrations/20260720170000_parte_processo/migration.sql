-- AlterTable
ALTER TABLE "Processo" DROP COLUMN "locadorNome",
DROP COLUMN "locadorTelefone",
DROP COLUMN "locatarioNome",
DROP COLUMN "locatarioTelefone",
ALTER COLUMN "tipoFianca" DROP NOT NULL,
ALTER COLUMN "fiancaNome" DROP NOT NULL,
ALTER COLUMN "rua" DROP NOT NULL,
ALTER COLUMN "bairro" DROP NOT NULL,
ALTER COLUMN "cidade" DROP NOT NULL,
ALTER COLUMN "estado" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ParteProcesso" (
    "id" TEXT NOT NULL,
    "tipo" "ParteInteressada" NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "processoId" TEXT NOT NULL,

    CONSTRAINT "ParteProcesso_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ParteProcesso" ADD CONSTRAINT "ParteProcesso_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "Processo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

