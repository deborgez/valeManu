"use client";

import { useState } from "react";
import { formatTelefone } from "@/lib/masks";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export type Parte = { tipo: "LOCADOR" | "LOCATARIO"; nome: string; telefone: string };

export default function ParteModal({
  onSalvar,
}: {
  onSalvar: (parte: Parte) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<"LOCADOR" | "LOCATARIO" | "">("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  function abrir() {
    setTipo("");
    setNome("");
    setTelefone("");
    setAberto(true);
  }

  function salvar() {
    if (!tipo || !nome || !telefone) return;
    onSalvar({ tipo, nome, telefone });
    setAberto(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="rounded border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        Adicionar Locador ou Locatário
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Adicionar Locador ou Locatário
            </h3>

            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Qual parte é essa?
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as "LOCADOR" | "LOCATARIO")}
              className={`${CAMPO_CLASSE} mb-4`}
            >
              <option value="" disabled>
                Selecione a parte
              </option>
              <option value="LOCADOR">Locador</option>
              <option value="LOCATARIO">Locatário</option>
            </select>

            {tipo && (
              <>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nome completo
                  </label>
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className={CAMPO_CLASSE}
                  />
                </div>
                <div className="mb-6">
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                    className={CAMPO_CLASSE}
                  />
                </div>
              </>
            )}

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
                disabled={!tipo || !nome || !telefone}
                className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
