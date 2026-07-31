"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ESPECIALIDADES_PRESTADOR } from "@/lib/labels";

type Prestador = {
  id: string;
  nome: string;
  especialidade: string;
  telefone: string;
  email: string | null;
};

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
      [p.nome, p.especialidade, p.telefone, p.email ?? ""]
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
            .map((p) => p.especialidade)
            .filter((e) => !ESPECIALIDADES_PRESTADOR.includes(e))
        )
      ).sort(),
    ];

    return ordem
      .map((especialidade) => ({
        especialidade,
        prestadores: filtrados.filter((p) => p.especialidade === especialidade),
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
            <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {grupo.especialidade}
            </h2>
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <table className="w-full text-left text-sm">
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
                      <td className="px-4 py-2">{p.nome}</td>
                      <td className="px-4 py-2">{p.telefone}</td>
                      <td className="px-4 py-2">{p.email ?? "-"}</td>
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
