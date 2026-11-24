"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export default function ConcluirVistoriaModal({
  action,
  hoje,
  participacao = false,
}: {
  action: (formData: FormData) => Promise<void>;
  hoje: string;
  participacao?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setErro(null);
          setAberto(true);
        }}
        className="rounded bg-slate-900 dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
      >
        Concluir
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <form
            action={async (formData) => {
              if (enviando) return;
              setEnviando(true);
              setErro(null);
              try {
                await action(formData);
                router.refresh();
                setAberto(false);
              } catch {
                setErro("Não foi possível concluir. Confira a data e o horário.");
              } finally {
                setEnviando(false);
              }
            }}
            className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
          >
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Concluir vistoria
            </h3>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Data
                </label>
                <input
                  type="date"
                  name="data"
                  required
                  min="2000-01-01"
                  max={hoje}
                  defaultValue={hoje}
                  className={CAMPO_CLASSE}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Horário
                </label>
                <input type="time" name="hora" required className={CAMPO_CLASSE} />
              </div>
            </div>
            {participacao && (
              <fieldset className="mb-4">
                <legend className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Quem participou da vistoria?
                </legend>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input type="checkbox" name="locadorParticipou" className="h-4 w-4" />
                  Locador participou
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input type="checkbox" name="locatarioParticipou" className="h-4 w-4" />
                  Locatário participou
                </label>
              </fieldset>
            )}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Descrição (opcional)
              </label>
              <textarea name="descricao" rows={3} className={CAMPO_CLASSE} />
            </div>
            {erro && <p className="mb-3 text-xs text-red-600 dark:text-red-400">{erro}</p>}
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
                Registrar entrega
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
