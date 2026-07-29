"use client";

import { useState } from "react";
import { formatCEP } from "@/lib/masks";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export type Endereco = {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

const ENDERECO_VAZIO: Endereco = {
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
};

type ViaCepResposta = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

export default function ImovelModal({
  valorAtual,
  onSalvar,
}: {
  valorAtual: Endereco | null;
  onSalvar: (endereco: Endereco) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState<Endereco>(valorAtual ?? ENDERECO_VAZIO);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function abrir() {
    setForm(valorAtual ?? ENDERECO_VAZIO);
    setErro(null);
    setAberto(true);
  }

  async function buscarCep(valorCep: string) {
    const digits = valorCep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setBuscando(true);
    setErro(null);

    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data: ViaCepResposta = await res.json();

      if (data.erro) {
        setErro("CEP não encontrado.");
        return;
      }

      setForm((atual) => ({
        ...atual,
        rua: data.logradouro ?? atual.rua,
        bairro: data.bairro ?? atual.bairro,
        cidade: data.localidade ?? atual.cidade,
        estado: data.uf ?? atual.estado,
      }));
    } catch {
      setErro("Não foi possível buscar o CEP agora. Preencha manualmente.");
    } finally {
      setBuscando(false);
    }
  }

  function salvar() {
    onSalvar(form);
    setAberto(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="rounded border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        {valorAtual ? "Editar Imóvel" : "Cadastrar Imóvel"}
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Endereço do Imóvel
            </h3>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                CEP
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="00000-000"
                  value={form.cep}
                  onChange={(e) => setForm({ ...form, cep: formatCEP(e.target.value) })}
                  onBlur={(e) => buscarCep(e.target.value)}
                  className={`${CAMPO_CLASSE} max-w-[160px]`}
                />
                <button
                  type="button"
                  onClick={() => buscarCep(form.cep)}
                  disabled={buscando}
                  className="rounded border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  {buscando ? "Buscando..." : "Buscar"}
                </button>
              </div>
              {erro && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erro}</p>}
            </div>

            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Rua
                </label>
                <input
                  value={form.rua}
                  onChange={(e) => setForm({ ...form, rua: e.target.value })}
                  className={CAMPO_CLASSE}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Número
                </label>
                <input
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  className={CAMPO_CLASSE}
                />
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Complemento (opcional)
                </label>
                <input
                  value={form.complemento}
                  onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                  className={CAMPO_CLASSE}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Bairro
                </label>
                <input
                  value={form.bairro}
                  onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                  className={CAMPO_CLASSE}
                />
              </div>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cidade
                </label>
                <input
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  className={CAMPO_CLASSE}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Estado
                </label>
                <input
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })}
                  maxLength={2}
                  placeholder="UF"
                  className={`${CAMPO_CLASSE} uppercase`}
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
                disabled={!form.rua || !form.bairro || !form.cidade || !form.estado}
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
