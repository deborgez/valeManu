"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BlobUploadInput from "@/components/inputs/BlobUploadInput";
import { IconeEditar } from "./icones";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

type Registro = {
  data: Date;
  termoUrl: string | null;
  termoNome: string | null;
  termoTipo: string | null;
  informeData: Date | null;
  informeArquivoUrl: string | null;
  informeArquivoNome: string | null;
  informeArquivoTipo: string | null;
};

export default function EntregaChavesModal({
  action,
  registro,
  hoje,
}: {
  action: (formData: FormData) => Promise<void>;
  registro?: Registro | null;
  hoje?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  return (
    <>
      {registro ? (
        <button
          type="button"
          onClick={() => setAberto(true)}
          title="Editar"
          className="rounded border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <IconeEditar />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="rounded border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Registrar a Entrega das Chaves
        </button>
      )}

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
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
          >
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {registro ? "Editar Entrega das Chaves" : "Entrega das Chaves"}
            </h3>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Data
              </label>
              <input
                type="date"
                name="data"
                required
                max={hoje}
                defaultValue={
                  registro ? registro.data.toISOString().slice(0, 10) : undefined
                }
                className={CAMPO_CLASSE}
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Termo de Entrega de Chaves
              </label>
              <BlobUploadInput
                name="termo"
                accept="image/*,application/pdf"
                defaultValue={
                  registro?.termoUrl
                    ? {
                        url: registro.termoUrl,
                        nome: registro.termoNome ?? "arquivo",
                        tipo: registro.termoTipo ?? "",
                      }
                    : undefined
                }
              />
            </div>

            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Informe ao Locador
            </p>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Data
              </label>
              <input
                type="date"
                name="informeData"
                max={hoje}
                defaultValue={
                  registro?.informeData
                    ? registro.informeData.toISOString().slice(0, 10)
                    : undefined
                }
                className={CAMPO_CLASSE}
              />
            </div>
            <div className="mb-6">
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Arquivo
              </label>
              <BlobUploadInput
                name="informeArquivo"
                accept="image/*,application/pdf"
                defaultValue={
                  registro?.informeArquivoUrl
                    ? {
                        url: registro.informeArquivoUrl,
                        nome: registro.informeArquivoNome ?? "arquivo",
                        tipo: registro.informeArquivoTipo ?? "",
                      }
                    : undefined
                }
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
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
