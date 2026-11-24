import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { atualizarServicosAgendados } from "@/lib/status";
import { formatEndereco } from "@/lib/endereco";
import { diasEmAberto, classificarSeveridade } from "@/lib/tempo";
import Link from "next/link";
import { redirect } from "next/navigation";
import PainelEtapas from "@/components/PainelEtapas";

type ManutencaoResumo = {
  id: string;
  numeroProcesso: string;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  natureza: string;
  status: string;
  emergencial: boolean;
  reaberta: boolean;
  diasPausados: number;
  createdAt: Date;
  pedidosOrcamento: { id: string }[];
  pagamentos: { status: string }[];
};

const ETAPAS: {
  titulo: string;
  filtro: (m: ManutencaoResumo) => boolean;
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
  {
    titulo: "Serviço Concluído",
    filtro: (m) =>
      m.status === "CONCLUIDA" && m.pagamentos[0]?.status !== "PAGO",
  },
  {
    titulo: "Pagamento Efetuado",
    filtro: (m) => m.status === "CONCLUIDA" && m.pagamentos[0]?.status === "PAGO",
  },
];

export default async function Home() {
  const session = await auth();
  if (!session) redirect("/login");

  await atualizarServicosAgendados();

  const manutencoes: ManutencaoResumo[] = await prisma.manutencao.findMany({
    select: {
      id: true,
      numeroProcesso: true,
      rua: true,
      numero: true,
      complemento: true,
      bairro: true,
      cidade: true,
      estado: true,
      natureza: true,
      status: true,
      emergencial: true,
      diasPausados: true,
      reaberta: true,
      createdAt: true,
      pedidosOrcamento: { select: { id: true } },
      pagamentos: {
        select: { status: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const etapas = ETAPAS.map((etapa) => ({
    titulo: etapa.titulo,
    itens: manutencoes.filter(etapa.filtro).map((m) => {
      const aberta = m.status !== "CONCLUIDA" && m.status !== "CANCELADA";
      return {
        id: m.id,
        numeroProcesso: m.numeroProcesso,
        endereco: formatEndereco(m),
        natureza: m.natureza,
        emergencial: m.emergencial,
        reaberta: m.reaberta,
        severidade: classificarSeveridade(diasEmAberto(m.createdAt, m.diasPausados), aberta),
      };
    }),
  }));

  const abertas = manutencoes.filter(
    (m) => m.status !== "CONCLUIDA" && m.status !== "CANCELADA"
  );
  const criticas = abertas.filter((m) => diasEmAberto(m.createdAt, m.diasPausados) >= 3).length;
  const emergenciais = abertas.filter((m) => m.emergencial).length;
  const aguardandoPagamento = manutencoes.filter(
    (m) => m.status === "CONCLUIDA" && m.pagamentos[0]?.status !== "PAGO"
  ).length;

  const resumo = [
    {
      titulo: "Em aberto",
      valor: abertas.length,
      detalhe: "manutenções em andamento",
      tom: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
      icone: (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </>
      ),
    },
    {
      titulo: "Em atraso",
      valor: criticas,
      detalhe: "abertas há 3 dias ou mais",
      tom: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
      icone: (
        <>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </>
      ),
    },
    {
      titulo: "Emergenciais",
      valor: emergenciais,
      detalhe: "em aberto agora",
      tom: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
      icone: (
        <>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </>
      ),
    },
    {
      titulo: "Aguardando pagamento",
      valor: aguardandoPagamento,
      detalhe: "serviços concluídos",
      tom: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
      icone: (
        <>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Painel de Manutenções
      </h1>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {resumo.map((card) => (
          <div
            key={card.titulo}
            className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
          >
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{card.valor}</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {card.titulo}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{card.detalhe}</p>
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-full ${card.tom}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                {card.icone}
              </svg>
            </div>
          </div>
        ))}
      </div>

      <PainelEtapas etapas={etapas} />

      <div className="mt-8 flex gap-4">
        <Link
          href="/manutencoes"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Ver quadro de Manutenções
        </Link>
        <Link
          href="/manutencoes/nova"
          className="rounded border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Nova Manutenção
        </Link>
      </div>
    </div>
  );
}
