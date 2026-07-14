import { atualizarServicosAgendados } from "@/lib/status";
import { prisma } from "@/lib/prisma";
import { formatEndereco } from "@/lib/endereco";
import { diasEmAberto, classificarSeveridade } from "@/lib/tempo";
import Link from "next/link";

type ManutencaoComRelacoes = Awaited<
  ReturnType<typeof buscarManutencoes>
>[number];

async function buscarManutencoes() {
  return prisma.manutencao.findMany({
    include: {
      inicioServicos: { orderBy: { createdAt: "desc" }, take: 1 },
      pedidosOrcamento: { select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

const COLUNAS: {
  titulo: string;
  filtro: (m: ManutencaoComRelacoes) => boolean;
}[] = [
  { titulo: "Solicitação", filtro: (m) => m.status === "SOLICITACAO" },
  {
    titulo: "Pedido de Orçamento",
    filtro: (m) =>
      m.status === "AGUARDANDO_ORCAMENTO" && m.pedidosOrcamento.length === 0,
  },
  {
    titulo: "Entrega de Orçamento",
    filtro: (m) =>
      m.status === "AGUARDANDO_ORCAMENTO" && m.pedidosOrcamento.length > 0,
  },
  {
    titulo: "Aprovação do Serviço",
    filtro: (m) => m.status === "AGUARDANDO_APROVACAO",
  },
  {
    titulo: "Início do Serviço",
    filtro: (m) =>
      m.status === "APROVADA" ||
      m.status === "AGENDADA" ||
      m.status === "EM_ANDAMENTO",
  },
  { titulo: "Concluída", filtro: (m) => m.status === "CONCLUIDA" },
];

const CARTAO_COR = {
  neutro:
    "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400",
  verde:
    "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950 hover:border-green-500",
  amarelo:
    "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 hover:border-amber-500",
  vermelho:
    "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950 hover:border-red-500",
};

const AVISO_COR = {
  neutro: "text-slate-500 dark:text-slate-400",
  verde: "text-green-800 dark:text-green-400",
  amarelo: "text-amber-800 dark:text-amber-400",
  vermelho: "text-red-800 dark:text-red-400",
};

function Cartao({ manutencao }: { manutencao: ManutencaoComRelacoes }) {
  const aberta = manutencao.status !== "CONCLUIDA";
  const dias = diasEmAberto(manutencao.createdAt);
  const severidade = classificarSeveridade(dias, aberta);
  const critico = aberta && dias >= 5;

  return (
    <Link
      href={`/manutencoes/${manutencao.id}`}
      className={`block rounded border p-3 shadow-sm ${CARTAO_COR[severidade]}`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {manutencao.numeroProcesso}
        </span>
        {manutencao.emergencial && (
          <span className="rounded bg-red-100 dark:bg-red-900 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
            Emergencial
          </span>
        )}
      </div>
      {manutencao.reaberta && (
        <span className="mb-1 inline-block rounded bg-orange-100 dark:bg-orange-900 px-2 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-400">
          Reaberto
        </span>
      )}
      <p className="mb-1 text-xs text-slate-600 dark:text-slate-400">{formatEndereco(manutencao)}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{manutencao.natureza}</p>
      {manutencao.inicioServicos[0]?.status === "AGENDADO" && (
        <span className="mt-2 inline-block rounded bg-amber-100 dark:bg-amber-900 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          Agendado
        </span>
      )}
      {manutencao.inicioServicos[0]?.status === "INICIADO_ANDAMENTO" &&
        manutencao.status !== "CONCLUIDA" && (
          <span className="mt-2 inline-block rounded bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
            Em andamento
          </span>
        )}
      {aberta && (
        <p className={`mt-2 text-xs font-bold ${AVISO_COR[severidade]}`}>
          {dias === 0 ? "Aberto hoje" : `Em aberto há ${dias} ${dias === 1 ? "dia" : "dias"}`}
          {critico && " — CRÍTICO"}
        </p>
      )}
    </Link>
  );
}

export default async function ManutencoesPage() {
  await atualizarServicosAgendados();
  const manutencoes = await buscarManutencoes();

  return (
    <div className="w-full p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Manutenções</h1>
        <Link
          href="/manutencoes/nova"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Nova Manutenção
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {COLUNAS.map((coluna) => {
          const itens = manutencoes.filter(coluna.filtro);
          return (
            <div key={coluna.titulo} className="rounded-lg bg-slate-100 dark:bg-slate-900 p-3">
              <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {coluna.titulo} ({itens.length})
              </h2>
              <div className="flex flex-col gap-2">
                {itens.map((m) => (
                  <Cartao key={m.id} manutencao={m} />
                ))}
                {itens.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">Nenhuma</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
