"use client";

import { useState } from "react";
import { formatTelefone, formatCPF } from "@/lib/masks";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export type Parte = {
  tipo: "LOCADOR" | "LOCATARIO";
  nome: string;
  telefone: string;
  rg: string;
  cpf: string;
};

const LABEL_PARTE: Record<"LOCADOR" | "LOCATARIO", string> = {
  LOCADOR: "Locador",
  LOCATARIO: "Locatário",
};

export default function ParteModal({
  tipo,
  onSalvar,
}: {
  tipo: "LOCADOR" | "LOCATARIO";
  onSalvar: (parte: Parte) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [rg, setRg] = useState("");
  const [cpf, setCpf] = useState("");

  function abrir() {
    setNome("");
    setTelefone("");
    setRg("");
    setCpf("");
    setAberto(true);
  }

  function podeSalvar() {
    return Boolean(nome && telefone && rg && cpf);
  }

  function salvar() {
    if (!podeSalvar()) return;
    onSalvar({ tipo, nome, telefone, rg, cpf });
    setAberto(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="rounded border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        Adicionar {LABEL_PARTE[tipo]}
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Adicionar {LABEL_PARTE[tipo]}
            </h3>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nome completo
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoFocus
                className={CAMPO_CLASSE}
              />
            </div>
            <div className="mb-4">
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
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  RG
                </label>
                <input value={rg} onChange={(e) => setRg(e.target.value)} className={CAMPO_CLASSE} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  CPF
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  className={CAMPO_CLASSE}
                />
              </div>
            </div>

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
                disabled={!podeSalvar()}
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
