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
    titulo: "Concluída",
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
      const aberta = m.status !== "CONCLUIDA";
      return {
        id: m.id,
        numeroProcesso: m.numeroProcesso,
        endereco: formatEndereco(m),
        natureza: m.natureza,
        emergencial: m.emergencial,
        reaberta: m.reaberta,
        severidade: classificarSeveridade(diasEmAberto(m.createdAt), aberta),
      };
    }),
  }));

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Painel de Manutenções
      </h1>

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
