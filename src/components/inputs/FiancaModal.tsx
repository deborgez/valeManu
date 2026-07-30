"use client";

import { useState } from "react";
import { formatTelefone, formatCPF } from "@/lib/masks";
import { LABEL_TIPO_FIANCA } from "@/lib/labels";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export type TipoGarantia =
  | "FIADOR"
  | "SEGURO_FIANCA"
  | "FIANCA_ONEROSA"
  | "TITULO_CAPITALIZACAO"
  | "CAUCAO_IMOBILIARIA"
  | "CAUCAO_DINHEIRO"
  | "SEM_GARANTIA";

export type Fianca = {
  tipo: TipoGarantia;
  nome: string;
  telefone: string;
  rg: string;
  cpf: string;
};

const TIPOS: TipoGarantia[] = [
  "FIADOR",
  "SEGURO_FIANCA",
  "FIANCA_ONEROSA",
  "TITULO_CAPITALIZACAO",
  "CAUCAO_IMOBILIARIA",
  "CAUCAO_DINHEIRO",
  "SEM_GARANTIA",
];

function precisaNome(tipo: TipoGarantia | ""): boolean {
  return tipo !== "" && tipo !== "SEM_GARANTIA";
}

export default function FiancaModal({
  valorAtual,
  onSalvar,
}: {
  valorAtual: Fianca | null;
  onSalvar: (fianca: Fianca) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<TipoGarantia | "">("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [rg, setRg] = useState("");
  const [cpf, setCpf] = useState("");

  function abrir() {
    setTipo(valorAtual?.tipo ?? "");
    setNome(valorAtual?.nome ?? "");
    setTelefone(valorAtual?.telefone ?? "");
    setRg(valorAtual?.rg ?? "");
    setCpf(valorAtual?.cpf ?? "");
    setAberto(true);
  }

  function podeSalvar() {
    if (!tipo) return false;
    if (precisaNome(tipo) && !nome) return false;
    if (tipo === "FIADOR" && (!telefone || !rg || !cpf)) return false;
    return true;
  }

  function salvar() {
    if (!podeSalvar() || !tipo) return;
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
        {valorAtual ? "Editar Garantia" : "Garantia"}
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Garantia
            </h3>

            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Tipo de Garantia
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoGarantia)}
              className={`${CAMPO_CLASSE} mb-4`}
            >
              <option value="" disabled>
                Selecione o tipo de garantia
              </option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {LABEL_TIPO_FIANCA[t]}
                </option>
              ))}
            </select>

            {precisaNome(tipo) && (
              <>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {tipo === "FIADOR" ? "Nome" : "Empresa"}
                  </label>
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className={CAMPO_CLASSE}
                  />
                </div>
                {tipo === "FIADOR" && (
                  <>
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
                    <div className="mb-6 grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                          RG
                        </label>
                        <input
                          value={rg}
                          onChange={(e) => setRg(e.target.value)}
                          className={CAMPO_CLASSE}
                        />
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
                  </>
                )}
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
                disabled={!podeSalvar()}
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
