"use client";

import { useState } from "react";
import BlobUploadInput from "@/components/inputs/BlobUploadInput";
import { IconeEditar } from "./icones";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

type Registro = {
  data: Date;
  forma: string;
  arquivoUrl: string | null;
  arquivoNome: string | null;
  arquivoTipo: string | null;
};

export default function AvisoPrevioModal({
  action,
  registro,
}: {
  action: (formData: FormData) => Promise<void>;
  registro?: Registro | null;
}) {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);

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
          className="w-fit rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Registrar Aviso Prévio
        </button>
      )}

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <form
            action={async (formData) => {
              if (enviando) return;
              setEnviando(true);
              await action(formData);
              setAberto(false);
              setEnviando(false);
            }}
            className="w-full max-w-md rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
          >
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {registro ? "Editar Aviso Prévio" : "Registrar Aviso Prévio do Locatário"}
            </h3>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Data
              </label>
              <input
                type="date"
                name="data"
                required
                defaultValue={
                  registro ? registro.data.toISOString().slice(0, 10) : undefined
                }
                className={CAMPO_CLASSE}
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Forma do Aviso
              </label>
              <select
                name="forma"
                required
                defaultValue={registro?.forma ?? "EMAIL"}
                className={CAMPO_CLASSE}
              >
                <option value="EMAIL">E-mail</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="TERMO">Termo</option>
              </select>
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
                {registro ? "Salvar" : "Registrar Aviso Prévio"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
