"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ESPECIALIDADES_PRESTADOR } from "@/lib/labels";
import { especialidadeCanonica } from "@/lib/especialidades";

type Prestador = {
  id: string;
  nome: string;
  empresa: string | null;
  especialidade: string;
  telefone: string;
  email: string | null;
};

const CORES_ESPECIALIDADE = [
  "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  "bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-300",
  "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300",
  "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
];

// Cada especialidade mantém sempre a mesma cor: oficiais pela posição na lista, outras pelo nome.
function corEspecialidade(nome: string): string {
  const posicao = ESPECIALIDADES_PRESTADOR.indexOf(nome);
  if (posicao >= 0) return CORES_ESPECIALIDADE[posicao % CORES_ESPECIALIDADE.length];
  let soma = 0;
  for (const c of nome) soma = (soma * 31 + c.charCodeAt(0)) % 997;
  return CORES_ESPECIALIDADE[soma % CORES_ESPECIALIDADE.length];
}

export default function PrestadoresBusca({
  prestadores,
  excluirPrestador,
}: {
  prestadores: Prestador[];
  excluirPrestador: (id: string) => Promise<void>;
}) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return prestadores;

    return prestadores.filter((p) =>
      [p.nome, p.empresa ?? "", p.especialidade, p.telefone, p.email ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(termo)
    );
  }, [busca, prestadores]);

  const grupos = useMemo(() => {
    const ordem = [
      ...ESPECIALIDADES_PRESTADOR,
      ...Array.from(
        new Set(
          filtrados
            .map((p) => especialidadeCanonica(p.especialidade))
            .filter((e) => !ESPECIALIDADES_PRESTADOR.includes(e))
        )
      ).sort(),
    ];

    return ordem
      .map((especialidade) => ({
        especialidade,
        prestadores: filtrados.filter((p) => especialidadeCanonica(p.especialidade) === especialidade),
      }))
      .filter((grupo) => grupo.prestadores.length > 0);
  }, [filtrados]);

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, especialidade, telefone ou email..."
          className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {grupos.length === 0 && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
          {prestadores.length === 0
            ? "Nenhum prestador cadastrado."
            : "Nenhum prestador encontrado para essa busca."}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {grupos.map((grupo) => (
          <div key={grupo.especialidade}>
            <div className="mb-3 flex items-center gap-3">
              <span
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${corEspecialidade(grupo.especialidade)}`}
              >
                {grupo.especialidade}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                {grupo.prestadores.length}{" "}
                {grupo.prestadores.length === 1 ? "prestador" : "prestadores"}
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <table className="w-full table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[34%]" />
                  <col className="w-[18%]" />
                  <col className="w-[30%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-2">Nome</th>
                    <th className="px-4 py-2">Telefone</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.prestadores.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100 dark:border-slate-700">
                      <td className="px-4 py-2">
                        {p.nome}
                        {especialidadeCanonica(p.especialidade) !== p.especialidade && (
                          <span className="block text-xs text-slate-400 dark:text-slate-500">
                            {p.especialidade}
                          </span>
                        )}
                        {p.empresa && (
                          <span className="block text-xs text-slate-500 dark:text-slate-400">
                            {p.empresa}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">{p.telefone}</td>
                      <td className="truncate px-4 py-2">{p.email ?? "-"}</td>
                      <td className="px-4 py-2 text-right">
                        <Link
                          href={`/prestadores/${p.id}`}
                          className="mr-3 text-slate-600 dark:text-slate-400 underline"
                        >
                          Editar
                        </Link>
                        <form
                          action={async () => {
                            await excluirPrestador(p.id);
                          }}
                          className="inline"
                        >
                          <button type="submit" className="text-red-600 dark:text-red-400 underline">
                            Excluir
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
