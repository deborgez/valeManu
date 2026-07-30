"use client";

import { useState } from "react";
import NumeroProcessoInput from "./NumeroProcessoInput";
import ImovelModal, { type Endereco } from "./ImovelModal";
import ParteModal, { type Parte } from "./ParteModal";
import FiancaModal, { type Fianca } from "./FiancaModal";
import CaptadorModal from "./CaptadorModal";
import { formatEndereco } from "@/lib/endereco";
import { LABEL_TIPO_FIANCA } from "@/lib/labels";

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
  const [captador, setCaptador] = useState<string | null>(null);

  function removerParte(index: number) {
    setPartes((atual) => atual.filter((_, i) => i !== index));
  }

  const locadores = partes
    .map((p, i) => ({ ...p, i }))
    .filter((p) => p.tipo === "LOCADOR");
  const locatarios = partes
    .map((p, i) => ({ ...p, i }))
    .filter((p) => p.tipo === "LOCATARIO");

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
        <div className="grid grid-cols-2 gap-4">
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
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Prazo de Contrato — Início
            </label>
            <input type="date" name="prazoContratoInicio" className={CAMPO_CLASSE} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Prazo de Contrato — Fim
            </label>
            <input type="date" name="prazoContratoFim" className={CAMPO_CLASSE} />
          </div>
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
          Captador
        </h2>
        <CaptadorModal valorAtual={captador} onSalvar={setCaptador} />
        {captador ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{captador}</p>
        ) : (
          <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
            Nenhum captador cadastrado ainda.
          </p>
        )}
        <input type="hidden" name="captador" value={captador ?? ""} />
      </section>

      <section className={SECAO_CLASSE}>
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Locador</h2>
        <ParteModal tipo="LOCADOR" onSalvar={(p) => setPartes((atual) => [...atual, p])} />
        {locadores.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2">
            {locadores.map((p) => (
              <li
                key={p.i}
                className="flex items-center justify-between rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
              >
                <span>
                  {p.nome} | {p.telefone} — RG {p.rg}, CPF {p.cpf}
                </span>
                <button
                  type="button"
                  onClick={() => removerParte(p.i)}
                  className="text-xs text-red-600 dark:text-red-400 underline"
                >
                  Remover
                </button>
                <input type="hidden" name="parteTipo" value={p.tipo} />
                <input type="hidden" name="parteNome" value={p.nome} />
                <input type="hidden" name="parteTelefone" value={p.telefone} />
                <input type="hidden" name="parteRg" value={p.rg} />
                <input type="hidden" name="parteCpf" value={p.cpf} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
            Nenhum locador adicionado ainda.
          </p>
        )}
      </section>

      <section className={SECAO_CLASSE}>
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Locatário
        </h2>
        <ParteModal tipo="LOCATARIO" onSalvar={(p) => setPartes((atual) => [...atual, p])} />
        {locatarios.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2">
            {locatarios.map((p) => (
              <li
                key={p.i}
                className="flex items-center justify-between rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
              >
                <span>
                  {p.nome} | {p.telefone} — RG {p.rg}, CPF {p.cpf}
                </span>
                <button
                  type="button"
                  onClick={() => removerParte(p.i)}
                  className="text-xs text-red-600 dark:text-red-400 underline"
                >
                  Remover
                </button>
                <input type="hidden" name="parteTipo" value={p.tipo} />
                <input type="hidden" name="parteNome" value={p.nome} />
                <input type="hidden" name="parteTelefone" value={p.telefone} />
                <input type="hidden" name="parteRg" value={p.rg} />
                <input type="hidden" name="parteCpf" value={p.cpf} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
            Nenhum locatário adicionado ainda.
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
            <input type="hidden" name="fiancaRg" value={fianca.rg} />
            <input type="hidden" name="fiancaCpf" value={fianca.cpf} />
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
