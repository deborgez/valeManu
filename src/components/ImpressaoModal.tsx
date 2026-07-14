"use client";

import { useState, type ReactNode } from "react";

export default function ImpressaoModal({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded border border-slate-300 dark:border-slate-600 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        {label}
      </button>

      {aberto && (
        <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="print-area flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-lg">
            <div className="print:hidden flex justify-end gap-2 border-b border-slate-200 p-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Imprimir
              </button>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-8">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
