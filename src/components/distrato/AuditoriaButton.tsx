"use client";

import { useState } from "react";
import { formatSistema } from "@/lib/datahora";

type Entrada = {
  id: string;
  acao: string;
  detalhe: string | null;
  createdAt: Date;
  usuario: { nome: string };
};

export default function AuditoriaButton({ entradas }: { entradas: Entrada[] }) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        title="Auditoria"
        className="rounded border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        Auditoria
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setAberto(false)}
        >
          <div
            className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Auditoria
            </h3>
            {entradas.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Nenhuma ação registrada.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {entradas.map((e) => (
                  <li
                    key={e.id}
                    className="rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
                  >
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-medium">
                        {e.detalhe ? e.detalhe : e.acao}
                      </span>{" "}
                      — {e.usuario.nome}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {formatSistema(e.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
