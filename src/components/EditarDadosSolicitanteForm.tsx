"use client";

import { useState } from "react";
import CpfInput from "./inputs/CpfInput";
import { LABEL_MANUTENCAO_STATUS, LABEL_PARTE } from "@/lib/labels";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

type Registro = {
  solicitanteTipo: "LOCADOR" | "LOCATARIO" | "IMOBILIARIA";
  solicitanteNome: string | null;
  solicitanteCpf: string | null;
  competencia: "LOCADOR" | "LOCATARIO" | "IMOBILIARIA";
  natureza: string;
  status: string;
};

export default function EditarDadosSolicitanteForm({
  registro,
  action,
}: {
  registro: Registro;
  action: (formData: FormData) => Promise<void>;
}) {
  const [editando, setEditando] = useState(false);

  if (!editando) {
    return (
      <div className="mt-3">
        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
          <p>
            <span className="text-slate-400 dark:text-slate-500">Solicitante: </span>
            {LABEL_PARTE[registro.solicitanteTipo]}
            {registro.solicitanteNome ? ` — ${registro.solicitanteNome}` : ""}
            {registro.solicitanteCpf ? ` (${registro.solicitanteCpf})` : ""}
          </p>
          <p>
            <span className="text-slate-400 dark:text-slate-500">Competência: </span>
            {LABEL_PARTE[registro.competencia]}
          </p>
          <p>
            <span className="text-slate-400 dark:text-slate-500">Natureza: </span>
            {registro.natureza}
          </p>
          <p>
            <span className="text-slate-400 dark:text-slate-500">Status: </span>
            {LABEL_MANUTENCAO_STATUS[registro.status] ?? registro.status}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="mt-2 text-xs text-slate-500 dark:text-slate-400 underline"
        >
          Editar dados do processo
        </button>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        await action(formData);
        setEditando(false);
      }}
      className="mt-3 rounded border border-slate-200 dark:border-slate-700 p-4"
    >
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Solicitante
          </label>
          <select
            name="solicitanteTipo"
            required
            defaultValue={registro.solicitanteTipo}
            className={CAMPO_CLASSE}
          >
            <option value="LOCADOR">Locador</option>
            <option value="LOCATARIO">Locatário</option>
            <option value="IMOBILIARIA">Imobiliária</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Nome do solicitante (opcional)
          </label>
          <input
            name="solicitanteNome"
            defaultValue={registro.solicitanteNome ?? ""}
            className={CAMPO_CLASSE}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          CPF do solicitante (opcional)
        </label>
        <CpfInput
          name="solicitanteCpf"
          defaultValue={registro.solicitanteCpf ?? ""}
          className={CAMPO_CLASSE}
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Competência
          </label>
          <select
            name="competencia"
            required
            defaultValue={registro.competencia}
            className={CAMPO_CLASSE}
          >
            <option value="LOCADOR">Locador</option>
            <option value="LOCATARIO">Locatário</option>
            <option value="IMOBILIARIA">Imobiliária</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Natureza
          </label>
          <select
            name="natureza"
            required
            defaultValue={registro.natureza}
            className={CAMPO_CLASSE}
          >
            <option value="Preventiva">Preventiva</option>
            <option value="Corretiva">Corretiva</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => setEditando(false)}
          className="rounded px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
