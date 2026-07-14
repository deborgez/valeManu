-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "ParteInteressada" AS ENUM ('LOCADOR', 'LOCATARIO');

-- CreateEnum
CREATE TYPE "ManutencaoStatus" AS ENUM ('SOLICITACAO', 'AGUARDANDO_ORCAMENTO', 'AGUARDANDO_APROVACAO', 'APROVADA', 'AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "PedidoOrcamentoStatus" AS ENUM ('AGUARDANDO_ENTREGA', 'NAO_ENTREGUE', 'ENTREGUE_AGUARDANDO_APROVACAO', 'APROVADO', 'REPROVADO');

-- CreateEnum
CREATE TYPE "AnexoTipo" AS ENUM ('FOTO', 'VIDEO', 'ORCAMENTO');

-- CreateEnum
CREATE TYPE "InicioServicoTipo" AS ENUM ('IMEDIATO', 'AGENDADO');

-- CreateEnum
CREATE TYPE "InicioServicoStatus" AS ENUM ('AGENDADO', 'INICIADO_ANDAMENTO');

-- CreateTable
CREATE TABLE "Imobiliaria" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "logoUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Imobiliaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cpf" TEXT,
    "email" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prestador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manutencao" (
    "id" TEXT NOT NULL,
    "numeroProcesso" TEXT NOT NULL,
    "cep" TEXT,
    "rua" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "solicitanteTipo" "ParteInteressada" NOT NULL,
    "solicitanteNome" TEXT,
    "solicitanteCpf" TEXT,
    "natureza" TEXT NOT NULL,
    "descricaoProblema" TEXT NOT NULL,
    "emergencial" BOOLEAN NOT NULL DEFAULT false,
    "competencia" "ParteInteressada" NOT NULL,
    "status" "ManutencaoStatus" NOT NULL DEFAULT 'SOLICITACAO',
    "reaberta" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "criadoPorId" TEXT NOT NULL,

    CONSTRAINT "Manutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoOrcamento" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "PedidoOrcamentoStatus" NOT NULL DEFAULT 'AGUARDANDO_ENTREGA',
    "valorMaoDeObra" DOUBLE PRECISION,
    "valorMaterial" DOUBLE PRECISION,
    "descricaoServico" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entregueEm" TIMESTAMP(3),
    "manutencaoId" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "geradoPorId" TEXT NOT NULL,

    CONSTRAINT "PedidoOrcamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anexo" (
    "id" TEXT NOT NULL,
    "tipo" "AnexoTipo" NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pedidoOrcamentoId" TEXT,

    CONSTRAINT "Anexo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InicioServico" (
    "id" TEXT NOT NULL,
    "tipo" "InicioServicoTipo" NOT NULL,
    "dataHoraAgendada" TIMESTAMP(3),
    "status" "InicioServicoStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "manutencaoId" TEXT NOT NULL,
    "pedidoOrcamentoAprovadoId" TEXT NOT NULL,

    CONSTRAINT "InicioServico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConclusaoServico" (
    "id" TEXT NOT NULL,
    "dataConclusao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacoes" TEXT,
    "manutencaoId" TEXT NOT NULL,

    CONSTRAINT "ConclusaoServico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Manutencao_numeroProcesso_key" ON "Manutencao"("numeroProcesso");

-- CreateIndex
CREATE UNIQUE INDEX "PedidoOrcamento_token_key" ON "PedidoOrcamento"("token");

-- CreateIndex
CREATE UNIQUE INDEX "InicioServico_manutencaoId_key" ON "InicioServico"("manutencaoId");

-- CreateIndex
CREATE UNIQUE INDEX "ConclusaoServico_manutencaoId_key" ON "ConclusaoServico"("manutencaoId");

-- AddForeignKey
ALTER TABLE "Manutencao" ADD CONSTRAINT "Manutencao_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoOrcamento" ADD CONSTRAINT "PedidoOrcamento_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoOrcamento" ADD CONSTRAINT "PedidoOrcamento_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Prestador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoOrcamento" ADD CONSTRAINT "PedidoOrcamento_geradoPorId_fkey" FOREIGN KEY ("geradoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_pedidoOrcamentoId_fkey" FOREIGN KEY ("pedidoOrcamentoId") REFERENCES "PedidoOrcamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InicioServico" ADD CONSTRAINT "InicioServico_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InicioServico" ADD CONSTRAINT "InicioServico_pedidoOrcamentoAprovadoId_fkey" FOREIGN KEY ("pedidoOrcamentoAprovadoId") REFERENCES "PedidoOrcamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConclusaoServico" ADD CONSTRAINT "ConclusaoServico_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

