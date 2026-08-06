"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CpfInput from "@/components/inputs/CpfInput";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export default function NovaAdequacaoModal({
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
        className="w-fit rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
      >
        Nova Solicitação de Adequação
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
            className="w-full max-w-md rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
          >
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Nova Solicitação de Adequação
            </h3>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Solicitante
                </label>
                <select name="solicitanteTipo" required defaultValue="IMOBILIARIA" className={CAMPO_CLASSE}>
                  <option value="LOCADOR">Locador</option>
                  <option value="LOCATARIO">Locatário</option>
                  <option value="IMOBILIARIA">Imobiliária</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nome do solicitante (opcional)
                </label>
                <input name="solicitanteNome" className={CAMPO_CLASSE} />
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                CPF do solicitante (opcional)
              </label>
              <CpfInput name="solicitanteCpf" className={CAMPO_CLASSE} />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Natureza
              </label>
              <select name="natureza" required defaultValue="Corretiva" className={CAMPO_CLASSE}>
                <option value="Preventiva">Preventiva</option>
                <option value="Corretiva">Corretiva</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Descrição da adequação
              </label>
              <textarea name="descricaoProblema" required rows={4} className={CAMPO_CLASSE} />
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Competência
                </label>
                <select name="competencia" required defaultValue="IMOBILIARIA" className={CAMPO_CLASSE}>
                  <option value="LOCADOR">Locador</option>
                  <option value="LOCATARIO">Locatário</option>
                  <option value="IMOBILIARIA">Imobiliária</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input id="emergencial" name="emergencial" type="checkbox" className="h-4 w-4" />
                <label htmlFor="emergencial" className="text-sm text-slate-700 dark:text-slate-300">
                  É emergencial
                </label>
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
                type="submit"
                disabled={enviando}
                className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-60"
              >
                Criar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
