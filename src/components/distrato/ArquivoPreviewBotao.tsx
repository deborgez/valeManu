"use client";

import { useState } from "react";

export default function ArquivoPreviewBotao({
  url,
  nome,
  tipo,
  label = "Ver arquivo",
}: {
  url: string;
  nome?: string | null;
  tipo?: string | null;
  label?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const ehImagem = (tipo ?? "").startsWith("image/");

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-xs text-slate-500 dark:text-slate-400 underline"
      >
        {label}
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setAberto(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white dark:bg-slate-800 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-4 py-3">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                {nome || "Arquivo"}
              </p>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="ml-4 shrink-0 rounded px-2 py-1 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Fechar
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {ehImagem ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={nome || "Arquivo"}
                  className="mx-auto max-h-[75vh] max-w-full object-contain"
                />
              ) : (
                <iframe src={url} title={nome || "Arquivo"} className="h-[75vh] w-full" />
              )}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-3 text-right">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-500 dark:text-slate-400 underline"
              >
                Abrir em nova guia
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
