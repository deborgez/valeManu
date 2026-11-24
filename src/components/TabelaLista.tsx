"use client";

import { useMemo, useState, type ReactNode } from "react";

export type ColunaLista = {
  chave: string;
  rotulo: string;
  ordenavel?: boolean;
};

export type LinhaLista = {
  id: string;
  busca: string;
  ordenar: Record<string, string | number>;
  linha: ReactNode;
};

export default function TabelaLista({
  colunas,
  linhas,
  vazio,
  porPagina = 15,
  comBusca = true,
  placeholderBusca = "Buscar...",
  ordemInicial,
}: {
  colunas: ColunaLista[];
  linhas: LinhaLista[];
  vazio: string;
  porPagina?: number;
  comBusca?: boolean;
  placeholderBusca?: string;
  ordemInicial?: { chave: string; direcao: "asc" | "desc" };
}) {
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState(ordemInicial ?? null);
  const [pagina, setPagina] = useState(1);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    let lista = termo ? linhas.filter((l) => l.busca.toLowerCase().includes(termo)) : linhas;
    if (ordem) {
      const fator = ordem.direcao === "asc" ? 1 : -1;
      lista = [...lista].sort((a, b) => {
        const va = a.ordenar[ordem.chave];
        const vb = b.ordenar[ordem.chave];
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * fator;
        return String(va ?? "").localeCompare(String(vb ?? ""), "pt-BR", { numeric: true }) * fator;
      });
    }
    return lista;
  }, [busca, ordem, linhas]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * porPagina;
  const visiveis = filtradas.slice(inicio, inicio + porPagina);

  function alternarOrdem(chave: string) {
    setPagina(1);
    setOrdem((atual) =>
      atual?.chave === chave
        ? { chave, direcao: atual.direcao === "asc" ? "desc" : "asc" }
        : { chave, direcao: "asc" }
    );
  }

  return (
    <>
      {comBusca && (
        <input
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(1);
          }}
          placeholder={placeholderBusca}
          className="mb-4 w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
        />
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
            <tr>
              {colunas.map((c) => {
                const ativa = ordem?.chave === c.chave;
                return (
                  <th key={c.chave} className="px-4 py-2">
                    {c.ordenavel ? (
                      <button
                        type="button"
                        onClick={() => alternarOrdem(c.chave)}
                        className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-slate-900 dark:hover:text-slate-100"
                      >
                        {c.rotulo}
                        <span className={ativa ? "opacity-100" : "opacity-30"}>
                          {ativa && ordem?.direcao === "desc" ? "↓" : "↑"}
                        </span>
                      </button>
                    ) : (
                      c.rotulo
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visiveis.map((l) => l.linha)}
            {visiveis.length === 0 && (
              <tr>
                <td
                  colSpan={colunas.length}
                  className="px-4 py-6 text-center text-slate-400 dark:text-slate-500"
                >
                  {linhas.length === 0 ? vazio : "Nada encontrado para essa busca."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtradas.length > porPagina && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Mostrando {inicio + 1}–{Math.min(inicio + porPagina, filtradas.length)} de{" "}
            {filtradas.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={paginaAtual === 1}
              onClick={() => setPagina(paginaAtual - 1)}
              className="rounded border border-slate-300 dark:border-slate-600 px-3 py-1 disabled:opacity-40"
            >
              Anterior
            </button>
            <span>
              {paginaAtual} / {totalPaginas}
            </span>
            <button
              type="button"
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPagina(paginaAtual + 1)}
              className="rounded border border-slate-300 dark:border-slate-600 px-3 py-1 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </>
  );
}
