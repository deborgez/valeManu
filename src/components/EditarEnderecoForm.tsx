"use client";

import { useState } from "react";
import EnderecoComCep, { EnderecoDefaults } from "./inputs/EnderecoComCep";

export default function EditarEnderecoForm({
  enderecoFormatado,
  defaultValues,
  action,
}: {
  enderecoFormatado: string;
  defaultValues: EnderecoDefaults;
  action: (formData: FormData) => Promise<void>;
}) {
  const [editando, setEditando] = useState(false);

  if (!editando) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {enderecoFormatado}
        </p>
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="text-xs text-slate-500 dark:text-slate-400 underline"
        >
          Editar endereço
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
      className="mt-2 rounded border border-slate-200 dark:border-slate-700 p-4"
    >
      <EnderecoComCep defaultValues={defaultValues} />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Salvar endereço
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
