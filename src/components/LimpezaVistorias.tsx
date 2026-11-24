"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type VistoriaLimpeza = {
  id: string;
  tipo: string;
  processo: string;
  solicitadaEm: string;
  solicitante: string;
  situacao: string;
  marcadaTeste: boolean;
};

export default function LimpezaVistorias({
  vistorias,
  onExcluir,
}: {
  vistorias: VistoriaLimpeza[];
  onExcluir: (ids: string[]) => Promise<void>;
}) {
  const [selecionadas, setSelecionadas] = useState<Set<string>>(
    new Set(vistorias.filter((v) => v.marcadaTeste).map((v) => v.id))
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  function alternar(id: string) {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  async function excluir() {
    if (selecionadas.size === 0 || enviando) return;
    const confirmado = confirm(
      `Excluir ${selecionadas.size} ${selecionadas.size === 1 ? "vistoria" : "vistorias"} de forma definitiva? Essa ação não pode ser desfeita.`
    );
    if (!confirmado) return;
    setEnviando(true);
    setErro(null);
    try {
      await onExcluir(Array.from(selecionadas));
      setSelecionadas(new Set());
      router.refresh();
    } catch {
      setErro("Não foi possível excluir. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => setSelecionadas(new Set(vistorias.map((v) => v.id)))}
          className="text-slate-500 underline dark:text-slate-400"
        >
          Selecionar todas
        </button>
        <button
          type="button"
          onClick={() => setSelecionadas(new Set())}
          className="text-slate-500 underline dark:text-slate-400"
        >
          Limpar seleção
        </button>
        <span className="text-slate-400 dark:text-slate-500">
          {selecionadas.size} de {vistorias.length} selecionadas
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="w-10 px-4 py-2"></th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Processo</th>
              <th className="px-4 py-2">Solicitada em</th>
              <th className="px-4 py-2">Solicitante</th>
              <th className="px-4 py-2">Situação</th>
            </tr>
          </thead>
          <tbody>
            {vistorias.map((v) => (
              <tr key={v.id} className="border-t border-slate-100 dark:border-slate-700">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selecionadas.has(v.id)}
                    onChange={() => alternar(v.id)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="px-4 py-2">{v.tipo}</td>
                <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">
                  {v.processo}
                  {v.marcadaTeste && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      TESTE
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">{v.solicitadaEm}</td>
                <td className="px-4 py-2">{v.solicitante}</td>
                <td className="px-4 py-2">{v.situacao}</td>
              </tr>
            ))}
            {vistorias.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Nenhuma vistoria cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {erro && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{erro}</p>}

      <button
        type="button"
        onClick={excluir}
        disabled={selecionadas.size === 0 || enviando}
        className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        Excluir selecionadas
      </button>
    </>
  );
}
