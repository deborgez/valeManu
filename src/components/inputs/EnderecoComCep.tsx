"use client";

import { formatCEP } from "@/lib/masks";
import { useRef, useState } from "react";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

type ViaCepResposta = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

export type EnderecoDefaults = {
  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
};

export default function EnderecoComCep({
  defaultValues,
}: {
  defaultValues?: EnderecoDefaults;
}) {
  const ruaRef = useRef<HTMLInputElement>(null);
  const bairroRef = useRef<HTMLInputElement>(null);
  const cidadeRef = useRef<HTMLInputElement>(null);
  const estadoRef = useRef<HTMLInputElement>(null);
  const numeroRef = useRef<HTMLInputElement>(null);

  const [cep, setCep] = useState(defaultValues?.cep ?? "");
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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

      if (ruaRef.current) ruaRef.current.value = data.logradouro ?? "";
      if (bairroRef.current) bairroRef.current.value = data.bairro ?? "";
      if (cidadeRef.current) cidadeRef.current.value = data.localidade ?? "";
      if (estadoRef.current) estadoRef.current.value = data.uf ?? "";
      numeroRef.current?.focus();
    } catch {
      setErro("Não foi possível buscar o CEP agora. Preencha manualmente.");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        CEP
      </label>
      <div className="flex gap-2">
        <input
          name="cep"
          type="text"
          inputMode="numeric"
          placeholder="00000-000"
          value={cep}
          onChange={(e) => setCep(formatCEP(e.target.value))}
          onBlur={(e) => buscarCep(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              buscarCep(cep);
            }
          }}
          className={`${CAMPO_CLASSE} max-w-[160px]`}
        />
        <button
          type="button"
          onClick={() => buscarCep(cep)}
          disabled={buscando}
          className="rounded border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
        >
          {buscando ? "Buscando..." : "Buscar"}
        </button>
      </div>
      {erro && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erro}</p>}

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Rua
          </label>
          <input
            ref={ruaRef}
            name="rua"
            required
            defaultValue={defaultValues?.rua ?? ""}
            className={CAMPO_CLASSE}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Número
          </label>
          <input
            ref={numeroRef}
            name="numero"
            defaultValue={defaultValues?.numero ?? ""}
            className={CAMPO_CLASSE}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Complemento (opcional)
          </label>
          <input
            name="complemento"
            defaultValue={defaultValues?.complemento ?? ""}
            className={CAMPO_CLASSE}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Bairro
          </label>
          <input
            ref={bairroRef}
            name="bairro"
            required
            defaultValue={defaultValues?.bairro ?? ""}
            className={CAMPO_CLASSE}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Cidade
          </label>
          <input
            ref={cidadeRef}
            name="cidade"
            required
            defaultValue={defaultValues?.cidade ?? ""}
            className={CAMPO_CLASSE}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Estado
          </label>
          <input
            ref={estadoRef}
            name="estado"
            required
            maxLength={2}
            placeholder="UF"
            defaultValue={defaultValues?.estado ?? ""}
            className={`${CAMPO_CLASSE} uppercase`}
          />
        </div>
      </div>
    </div>
  );
}
