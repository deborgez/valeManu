"use client";

import { useState } from "react";
import MoedaInput from "./inputs/MoedaInput";

export default function ContraofertaForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        Fazer contraoferta
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <form
        action={(formData) => {
          if (enviando) return;
          setEnviando(true);
          action(formData);
        }}
        className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
      >
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Fazer contraoferta
        </h3>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Mão de obra (R$)
            </label>
            <MoedaInput
              name="contraOfertaValorMaoDeObra"
              required
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Material (R$)
            </label>
            <MoedaInput
              name="contraOfertaValorMaterial"
              required
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
          Mensagem ao prestador (opcional)
        </label>
        <textarea
          name="contraOfertaObservacao"
          rows={3}
          className="mb-6 w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setAberto(false)}
            disabled={enviando}
            className="rounded px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar contraoferta"}
          </button>
        </div>
      </form>
    </div>
  );
}
