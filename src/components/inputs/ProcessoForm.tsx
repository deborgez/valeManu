"use client";

import { useState } from "react";
import NumeroProcessoInput from "./NumeroProcessoInput";
import ImovelModal, { type Endereco } from "./ImovelModal";
import ParteModal, { type Parte } from "./ParteModal";
import FiancaModal, { type Fianca } from "./FiancaModal";
import { formatEndereco } from "@/lib/endereco";
import { LABEL_TIPO_FIANCA, LABEL_PARTE } from "@/lib/labels";

export default function ProcessoForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [partes, setPartes] = useState<Parte[]>([]);
  const [fianca, setFianca] = useState<Fianca | null>(null);

  function removerParte(index: number) {
    setPartes((atual) => atual.filter((_, i) => i !== index));
  }

  return (
    <form
      action={action}
      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
    >
      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Número do Processo
        </label>
        <NumeroProcessoInput
          name="numeroProcesso"
          required
          className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Imóvel */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <ImovelModal valorAtual={endereco} onSalvar={setEndereco} />
          {endereco && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {formatEndereco(endereco)}
            </p>
          )}
        </div>
        {endereco && (
          <>
            <input type="hidden" name="cep" value={endereco.cep} />
            <input type="hidden" name="rua" value={endereco.rua} />
            <input type="hidden" name="numero" value={endereco.numero} />
            <input type="hidden" name="complemento" value={endereco.complemento} />
            <input type="hidden" name="bairro" value={endereco.bairro} />
            <input type="hidden" name="cidade" value={endereco.cidade} />
            <input type="hidden" name="estado" value={endereco.estado} />
          </>
        )}
      </div>

      {/* Partes */}
      <div className="mb-6">
        <div className="mb-2">
          <ParteModal onSalvar={(p) => setPartes((atual) => [...atual, p])} />
        </div>
        {partes.length > 0 && (
          <ul className="flex flex-col gap-2">
            {partes.map((p, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
              >
                <span>
                  <span className="font-medium">{LABEL_PARTE[p.tipo]}</span> — {p.nome} (
                  {p.telefone})
                </span>
                <button
                  type="button"
                  onClick={() => removerParte(i)}
                  className="text-xs text-red-600 dark:text-red-400 underline"
                >
                  Remover
                </button>
                <input type="hidden" name="parteTipo" value={p.tipo} />
                <input type="hidden" name="parteNome" value={p.nome} />
                <input type="hidden" name="parteTelefone" value={p.telefone} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Fiança */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <FiancaModal valorAtual={fianca} onSalvar={setFianca} />
          {fianca && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {LABEL_TIPO_FIANCA[fianca.tipo]} — {fianca.nome}
              {fianca.telefone ? ` (${fianca.telefone})` : ""}
            </p>
          )}
        </div>
        {fianca && (
          <>
            <input type="hidden" name="tipoFianca" value={fianca.tipo} />
            <input type="hidden" name="fiancaNome" value={fianca.nome} />
            <input type="hidden" name="fiancaTelefone" value={fianca.telefone} />
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={!endereco || partes.length === 0}
        className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50"
      >
        Cadastrar Processo
      </button>
    </form>
  );
}
