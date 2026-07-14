"use client";

import { useState } from "react";

export default function ReabrirServicoForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded border border-orange-300 dark:border-orange-700 px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950"
      >
        Reabrir serviço
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <form
        action={action}
        className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
      >
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Reabrir serviço
        </h3>

        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Motivo da reabertura
        </label>
        <textarea
          name="motivo"
          required
          rows={3}
          autoFocus
          className="mb-6 w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setAberto(false)}
            className="rounded px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded bg-orange-600 dark:bg-orange-700 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 dark:hover:bg-orange-800"
          >
            Confirmar reabertura
          </button>
        </div>
      </form>
    </div>
  );
}
