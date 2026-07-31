"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BlobUploadInput from "@/components/inputs/BlobUploadInput";
import { IconeEditar } from "./icones";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

type Registro = {
  data: Date;
  comunicacaoData: Date | null;
  comunicacaoArquivoUrl: string | null;
  comunicacaoArquivoNome: string | null;
  comunicacaoArquivoTipo: string | null;
  locadorNaoQuerParticipar: boolean;
  naoParticiparArquivoUrl: string | null;
  naoParticiparArquivoNome: string | null;
  naoParticiparArquivoTipo: string | null;
};

export default function AgendamentoVistoriaModal({
  action,
  registro,
  hoje,
}: {
  action: (formData: FormData) => Promise<void>;
  registro?: Registro | null;
  hoje?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [naoQuerParticipar, setNaoQuerParticipar] = useState(
    registro?.locadorNaoQuerParticipar ?? false
  );
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
          Agendamento de Vistoria de Saída
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
              {registro ? "Editar Agendamento de Vistoria de Saída" : "Agendamento de Vistoria de Saída"}
            </h3>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Data da vistoria
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

            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Comunicação ao proprietário
            </p>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Data
              </label>
              <input
                type="date"
                name="comunicacaoData"
                max={hoje}
                defaultValue={
                  registro?.comunicacaoData
                    ? registro.comunicacaoData.toISOString().slice(0, 10)
                    : undefined
                }
                className={CAMPO_CLASSE}
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Arquivo
              </label>
              <BlobUploadInput
                name="comunicacaoArquivo"
                accept="image/*,application/pdf"
                defaultValue={
                  registro?.comunicacaoArquivoUrl
                    ? {
                        url: registro.comunicacaoArquivoUrl,
                        nome: registro.comunicacaoArquivoNome ?? "arquivo",
                        tipo: registro.comunicacaoArquivoTipo ?? "",
                      }
                    : undefined
                }
              />
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

            {naoQuerParticipar && (
              <div className="mb-6">
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Arquivo
                </label>
                <BlobUploadInput
                  name="naoParticiparArquivo"
                  accept="image/*,application/pdf"
                  defaultValue={
                    registro?.naoParticiparArquivoUrl
                      ? {
                          url: registro.naoParticiparArquivoUrl,
                          nome: registro.naoParticiparArquivoNome ?? "arquivo",
                          tipo: registro.naoParticiparArquivoTipo ?? "",
                        }
                      : undefined
                  }
                />
              </div>
            )}

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
