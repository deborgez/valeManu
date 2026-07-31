"use client";

import { useState } from "react";
import BlobUploadInput from "@/components/inputs/BlobUploadInput";
import { IconeEditar } from "./icones";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

type Registro = {
  forma: string;
  arquivoUrl: string | null;
  arquivoNome: string | null;
  arquivoTipo: string | null;
  dataPrevistaEntregaChaves: Date | null;
  dataPrevistaVistoriaSaida: Date | null;
  anotacoes: string | null;
};

export default function ContatoModal({
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
          Registrar Contato
        </button>
      )}

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <form
            action={(formData) => {
              if (enviando) return;
              setEnviando(true);
              action(formData);
              setAberto(false);
            }}
            className="w-full max-w-md rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
          >
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {registro ? "Editar Contato" : "Registrar Contato"}
            </h3>

            {!registro && (
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                Data e hora serão registradas automaticamente pelo sistema.
              </p>
            )}

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Forma de Comunicação
              </label>
              <select
                name="forma"
                required
                defaultValue={registro?.forma ?? "LIGACAO"}
                className={CAMPO_CLASSE}
              >
                <option value="LIGACAO">Ligação</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
            </div>

            <div className="mb-4">
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

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Previsão de entrega de chaves
                </label>
                <input
                  type="date"
                  name="dataPrevistaEntregaChaves"
                  defaultValue={
                    registro?.dataPrevistaEntregaChaves
                      ? registro.dataPrevistaEntregaChaves.toISOString().slice(0, 10)
                      : undefined
                  }
                  className={CAMPO_CLASSE}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Previsão de vistoria de saída
                </label>
                <input
                  type="date"
                  name="dataPrevistaVistoriaSaida"
                  defaultValue={
                    registro?.dataPrevistaVistoriaSaida
                      ? registro.dataPrevistaVistoriaSaida.toISOString().slice(0, 10)
                      : undefined
                  }
                  className={CAMPO_CLASSE}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Anotações
              </label>
              <textarea
                name="anotacoes"
                rows={3}
                defaultValue={registro?.anotacoes ?? ""}
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
                {registro ? "Salvar" : "Contato Realizado"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
