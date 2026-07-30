"use client";

import { useState } from "react";
import NumeroProcessoInput from "./NumeroProcessoInput";
import ImovelModal, { type Endereco } from "./ImovelModal";
import ParteModal, { type Parte } from "./ParteModal";
import FiancaModal, { type Fianca } from "./FiancaModal";
import { formatEndereco } from "@/lib/endereco";
import { LABEL_TIPO_FIANCA, LABEL_PARTE } from "@/lib/labels";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

const SECAO_CLASSE =
  "mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6";

export default function ProcessoForm({
  action,
  unidadePadrao,
}: {
  action: (formData: FormData) => Promise<void>;
  unidadePadrao?: string;
}) {
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [partes, setPartes] = useState<Parte[]>([]);
  const [fianca, setFianca] = useState<Fianca | null>(null);

  function removerParte(index: number) {
    setPartes((atual) => atual.filter((_, i) => i !== index));
  }

  const faltando = [
    !endereco && "imóvel",
    partes.length === 0 && "ao menos um locador ou locatário",
  ].filter(Boolean) as string[];

  return (
    <form action={action}>
      <section className={SECAO_CLASSE}>
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Dados do Processo
        </h2>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Número do Processo
            </label>
            <NumeroProcessoInput name="numeroProcesso" required className={CAMPO_CLASSE} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Unidade
            </label>
            <input name="unidade" defaultValue={unidadePadrao} className={CAMPO_CLASSE} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Captador
          </label>
          <input name="captador" className={CAMPO_CLASSE} />
        </div>
      </section>

      <section className={SECAO_CLASSE}>
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Imóvel</h2>
        <ImovelModal valorAtual={endereco} onSalvar={setEndereco} />
        {endereco ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {endereco.codigoImovel && `Código ${endereco.codigoImovel} — `}
            {formatEndereco(endereco)}
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
            Nenhum imóvel cadastrado ainda.
          </p>
        )}
        {endereco && (
          <>
            <input type="hidden" name="codigoImovel" value={endereco.codigoImovel} />
            <input type="hidden" name="cep" value={endereco.cep} />
            <input type="hidden" name="rua" value={endereco.rua} />
            <input type="hidden" name="numero" value={endereco.numero} />
            <input type="hidden" name="complemento" value={endereco.complemento} />
            <input type="hidden" name="bairro" value={endereco.bairro} />
            <input type="hidden" name="cidade" value={endereco.cidade} />
            <input type="hidden" name="estado" value={endereco.estado} />
          </>
        )}
      </section>

      <section className={SECAO_CLASSE}>
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Locador e Locatário
        </h2>
        <div className="flex gap-2">
          <ParteModal tipo="LOCADOR" onSalvar={(p) => setPartes((atual) => [...atual, p])} />
          <ParteModal tipo="LOCATARIO" onSalvar={(p) => setPartes((atual) => [...atual, p])} />
        </div>
        {partes.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2">
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
        ) : (
          <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
            Nenhuma parte adicionada ainda.
          </p>
        )}
      </section>

      <section className={SECAO_CLASSE}>
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Garantia
        </h2>
        <FiancaModal valorAtual={fianca} onSalvar={setFianca} />
        {fianca ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {LABEL_TIPO_FIANCA[fianca.tipo]}
            {fianca.nome ? ` — ${fianca.nome}` : ""}
            {fianca.telefone ? ` (${fianca.telefone})` : ""}
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
            Nenhuma garantia cadastrada ainda.
          </p>
        )}
        {fianca && (
          <>
            <input type="hidden" name="tipoFianca" value={fianca.tipo} />
            <input type="hidden" name="fiancaNome" value={fianca.nome} />
            <input type="hidden" name="fiancaTelefone" value={fianca.telefone} />
          </>
        )}
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={faltando.length > 0}
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50"
        >
          Cadastrar Processo
        </button>
        {faltando.length > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Falta cadastrar: {faltando.join(" e ")}.
          </p>
        )}
      </div>
    </form>
  );
}
