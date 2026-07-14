"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

type Item = {
  id: string;
  titulo: string;
  subtitulo: string;
  href: string;
};

export default function ListaClicavel({
  titulo,
  itens,
  trigger,
}: {
  titulo: string;
  itens: Item[];
  trigger: ReactNode;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setAberto(true)} className="w-full text-left">
        {trigger}
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setAberto(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {titulo} ({itens.length})
              </h3>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {itens.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm hover:border-slate-300 dark:hover:border-slate-600"
                >
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {item.titulo}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.subtitulo}
                  </p>
                </Link>
              ))}
              {itens.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Nenhum item encontrado.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
