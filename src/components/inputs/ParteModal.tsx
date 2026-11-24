"use client";

import { useState } from "react";
import { formatTelefone, formatCPF } from "@/lib/masks";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export type Parte = {
  tipo: "LOCADOR" | "LOCATARIO";
  nome: string;
  telefone: string;
  cpf: string;
};

const LABEL_PARTE: Record<"LOCADOR" | "LOCATARIO", string> = {
  LOCADOR: "Locador",
  LOCATARIO: "Locatário",
};

export default function ParteModal({
  tipo,
  onSalvar,
  parteInicial,
}: {
  tipo: "LOCADOR" | "LOCATARIO";
  onSalvar: (parte: Parte) => void;
  /** Quando informada, o modal edita essa parte em vez de adicionar uma nova. */
  parteInicial?: Parte;
}) {
  const editando = Boolean(parteInicial);
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");

  function abrir() {
    setNome(parteInicial?.nome ?? "");
    setTelefone(parteInicial?.telefone ?? "");
    setCpf(parteInicial?.cpf ?? "");
    setAberto(true);
  }

  function podeSalvar() {
    return Boolean(nome && telefone && cpf);
  }

  function salvar() {
    if (!podeSalvar()) return;
    onSalvar({ tipo, nome, telefone, cpf });
    setAberto(false);
  }

  return (
    <>
      {editando ? (
        <button
          type="button"
          onClick={abrir}
          className="text-xs text-slate-600 dark:text-slate-300 underline"
        >
          Editar
        </button>
      ) : (
        <button
          type="button"
          onClick={abrir}
          className="rounded border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Adicionar {LABEL_PARTE[tipo]}
        </button>
      )}

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {editando ? "Editar" : "Adicionar"} {LABEL_PARTE[tipo]}
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
            <div className="mb-4">
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
                {editando ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
