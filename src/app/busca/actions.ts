"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEndereco } from "@/lib/endereco";

export type ResultadoBusca = {
  tipo: "Processo" | "Manutenção" | "Distrato";
  titulo: string;
  subtitulo: string;
  href: string;
};

export async function buscaGlobal(termo: string): Promise<ResultadoBusca[]> {
  const session = await auth();
  if (!session) return [];
  const role = session.user.role;
  if (role === "VISTORIADOR") return [];

  const q = termo.trim();
  if (q.length < 2) return [];

  const filtroProcesso = {
    OR: [
      { numeroProcesso: { contains: q, mode: "insensitive" as const } },
      { rua: { contains: q, mode: "insensitive" as const } },
      { bairro: { contains: q, mode: "insensitive" as const } },
    ],
  };

  const processos = await prisma.processo.findMany({
    where: filtroProcesso,
    take: 6,
    orderBy: { numeroProcesso: "asc" },
  });

  const resultados: ResultadoBusca[] = processos.map((p) => ({
    tipo: "Processo",
    titulo: p.numeroProcesso,
    subtitulo: formatEndereco(p),
    href: `/cadastro/${p.id}`,
  }));

  if (role === "CORRETOR") return resultados;

  const [manutencoes, distratos] = await Promise.all([
    prisma.manutencao.findMany({
      where: {
        OR: [
          { numeroProcesso: { contains: q, mode: "insensitive" } },
          { rua: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    prisma.distrato.findMany({
      where: { processo: filtroProcesso },
      include: { processo: true },
      take: 5,
    }),
  ]);

  return [
    ...resultados,
    ...manutencoes.map((m) => ({
      tipo: "Manutenção" as const,
      titulo: m.numeroProcesso,
      subtitulo: formatEndereco(m),
      href: `/manutencoes/${m.id}`,
    })),
    ...distratos.map((d) => ({
      tipo: "Distrato" as const,
      titulo: d.processo.numeroProcesso,
      subtitulo: formatEndereco(d.processo),
      href: `/distrato/${d.id}`,
    })),
  ];
}
