"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BlobUploadInput from "@/components/inputs/BlobUploadInput";
import { IconeEditar } from "./icones";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800";

type Registro = {
  data: Date | null;
  hora: string | null;
  locadorNaoQuerParticipar: boolean;
  arquivoUrl: string | null;
  arquivoNome: string | null;
  arquivoTipo: string | null;
};

export default function ComunicadoVistoriaModal({
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
  const [naoQuerParticipar, setNaoQuerParticipar] = useState(
    registro?.locadorNaoQuerParticipar ?? false
  );
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
          Registrar Comunicado
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
              {registro ? "Editar Comunicado ao Locador" : "Registrar Comunicado ao Locador"}
            </h3>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Data
                </label>
                <input
                  type="date"
                  name="data"
                  disabled={naoQuerParticipar}
                  max={hoje}
                  defaultValue={
                    registro?.data ? registro.data.toISOString().slice(0, 10) : ""
                  }
                  className={CAMPO_CLASSE}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Horário
                </label>
                <input
                  type="time"
                  name="hora"
                  disabled={naoQuerParticipar}
                  defaultValue={registro?.hora ?? ""}
                  className={CAMPO_CLASSE}
                />
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <input
                id="naoQuerParticipar"
                type="checkbox"
                name="locadorNaoQuerParticipar"
                checked={naoQuerParticipar}
                onChange={(e) => setNaoQuerParticipar(e.target.checked)}
                className="h-4 w-4"
              />
              <label
                htmlFor="naoQuerParticipar"
                className="text-sm text-slate-700 dark:text-slate-300"
              >
                Locador não quer participar
              </label>
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Arquivo
              </label>
              <BlobUploadInput
                name="arquivo"
                accept="image/*,application/pdf"
                defaultValue={
                  registro?.arquivoUrl
                    ? {
                        url: registro.arquivoUrl,
                        nome: registro.arquivoNome ?? "arquivo",
                        tipo: registro.arquivoTipo ?? "",
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
                Registrar Comunicado
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
