"use client";

import { useMemo, useState, type ReactNode } from "react";

export type ItemVistoria = {
  id: string;
  busca: string;
  linha: ReactNode;
};

export default function BuscaVistorias({
  itens,
  cabecalho,
  colunas,
  vazio,
}: {
  itens: ItemVistoria[];
  cabecalho: ReactNode;
  colunas: number;
  vazio: string;
}) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return itens;
    return itens.filter((i) => i.busca.toLowerCase().includes(termo));
  }, [busca, itens]);

  return (
    <>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por processo, endereço, solicitante ou situação"
        className="mb-4 w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
      />

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
            {cabecalho}
          </thead>
          <tbody>
            {filtrados.map((i) => i.linha)}
            {filtrados.length === 0 && (
              <tr>
                <td
                  colSpan={colunas}
                  className="px-4 py-6 text-center text-slate-400 dark:text-slate-500"
                >
                  {itens.length === 0 ? vazio : "Nenhuma vistoria encontrada para essa busca."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
