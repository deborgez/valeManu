"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BlobUploadInput from "@/components/inputs/BlobUploadInput";

export default function SolicitarVistoriaSaidaModal({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
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
        className="w-fit rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
      >
        Solicitar Vistoria de Saída
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
                setErro("Não foi possível solicitar a vistoria. Anexe o comprovante e tente novamente.");
              } finally {
                setEnviando(false);
              }
            }}
            className="w-full max-w-md rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
          >
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Solicitar Vistoria de Saída
            </h3>

            <fieldset className="mb-4">
              <legend className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                Participação na vistoria
              </legend>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" name="locadorDesejaParticipar" className="h-4 w-4" />
                Locador deseja participar
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" name="locatarioDesejaParticipar" className="h-4 w-4" />
                Locatário deseja participar
              </label>
            </fieldset>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Comprovante do pagamento do sinal
              </label>
              <BlobUploadInput name="comprovante" accept="image/*,application/pdf" required />
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
                Solicitar Vistoria de Saída
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
