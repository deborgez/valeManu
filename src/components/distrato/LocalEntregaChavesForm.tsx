"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SELECT_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export default function LocalEntregaChavesForm({
  action,
  valorAtual,
}: {
  action: (formData: FormData) => Promise<void>;
  valorAtual?: string | null;
}) {
  const [enviando, setEnviando] = useState(false);
  const [editando, setEditando] = useState(false);
  const router = useRouter();

  if (valorAtual && !editando) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <p className="text-slate-700 dark:text-slate-300">
          Entrega das chaves:{" "}
          <span className="font-medium">
            {valorAtual === "IMOBILIARIA" ? "Na imobiliária" : "No imóvel"}
          </span>
        </p>
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="rounded border border-slate-300 dark:border-slate-600 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Alterar
        </button>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        if (enviando) return;
        setEnviando(true);
        await action(formData);
        router.refresh();
        setEnviando(false);
        setEditando(false);
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Onde a entrega das chaves ocorrerá?
        </label>
        <select
          name="local"
          required
          defaultValue={valorAtual ?? ""}
          className={SELECT_CLASSE}
        >
          <option value="" disabled>
            Selecione
          </option>
          <option value="IMOBILIARIA">Na imobiliária</option>
          <option value="IMOVEL">No imóvel</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={enviando}
        className="w-fit rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-60"
      >
        Confirmar
      </button>
      {valorAtual && (
        <button
          type="button"
          onClick={() => setEditando(false)}
          className="w-fit rounded px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Cancelar
        </button>
      )}
    </form>
  );
}
