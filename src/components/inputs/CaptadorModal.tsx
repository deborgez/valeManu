"use client";

import { useState } from "react";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export default function CaptadorModal({
  valorAtual,
  onSalvar,
}: {
  valorAtual: string | null;
  onSalvar: (nome: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");

  function abrir() {
    setNome(valorAtual ?? "");
    setAberto(true);
  }

  function salvar() {
    if (!nome) return;
    onSalvar(nome);
    setAberto(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="rounded border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        {valorAtual ? "Editar Captador" : "Captador"}
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Captador
            </h3>

            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome
            </label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
              className={`${CAMPO_CLASSE} mb-6`}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvar}
                disabled={!nome}
                className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
