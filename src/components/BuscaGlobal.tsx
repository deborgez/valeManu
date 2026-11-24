"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buscaGlobal, type ResultadoBusca } from "@/app/busca/actions";

export default function BuscaGlobal() {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [aberto, setAberto] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const contador = useRef(0);
  const router = useRouter();

  useEffect(() => {
    const q = termo.trim();
    if (q.length < 2) return;
    const minhaBusca = ++contador.current;
    const espera = setTimeout(async () => {
      setBuscando(true);
      try {
        const lista = await buscaGlobal(q);
        if (minhaBusca === contador.current) setResultados(lista);
      } finally {
        if (minhaBusca === contador.current) setBuscando(false);
      }
    }, 250);
    return () => clearTimeout(espera);
  }, [termo]);

  const lista = termo.trim().length < 2 ? [] : resultados;

  function ir(href: string) {
    setAberto(false);
    setTermo("");
    router.push(href);
  }

  return (
    <div className="relative hidden w-72 md:block">
      <input
        value={termo}
        onChange={(e) => {
          setTermo(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        placeholder="Buscar processo ou endereço..."
        aria-label="Busca global"
        className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
      {aberto && termo.trim().length >= 2 && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setAberto(false)} />
          <div className="absolute left-0 right-0 z-40 mt-2 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
            {buscando && lista.length === 0 && (
              <p className="px-3 py-3 text-sm text-slate-400">Buscando...</p>
            )}
            {!buscando && lista.length === 0 && (
              <p className="px-3 py-3 text-sm text-slate-400">Nada encontrado.</p>
            )}
            {lista.map((r) => (
              <button
                key={`${r.tipo}-${r.href}`}
                type="button"
                onClick={() => ir(r.href)}
                className="flex w-full items-start gap-2 border-b border-slate-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700"
              >
                <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {r.tipo}
                </span>
                <span>
                  <span className="block font-medium text-slate-900 dark:text-slate-100">
                    {r.titulo}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {r.subtitulo}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
