"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export default function EnviarJuridicoModal({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900"
      >
        Enviar para o Jurídico
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <form
            action={async (formData) => {
              if (enviando) return;
              setEnviando(true);
              await action(formData);
              router.refresh();
              setAberto(false);
              setEnviando(false);
            }}
            className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
          >
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Enviar Acordo para o Jurídico
            </h3>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Motivo (opcional)
              </label>
              <textarea
                name="motivo"
                rows={3}
                placeholder="Ex.: parcelas em atraso sem retorno do locatário"
                className={CAMPO_CLASSE}
              />
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
                type="submit"
                disabled={enviando}
                className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-60"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
