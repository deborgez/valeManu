"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmarAcaoBotao({
  rotulo,
  pergunta,
  confirmarRotulo,
  perigo = false,
  onConfirmar,
}: {
  rotulo: string;
  pergunta: string;
  confirmarRotulo: string;
  perigo?: boolean;
  onConfirmar: () => Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  async function confirmar() {
    if (enviando) return;
    setEnviando(true);
    setErro(null);
    try {
      await onConfirmar();
      setAberto(false);
      router.refresh();
    } catch {
      setErro("Não foi possível concluir a ação. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setErro(null);
          setAberto(true);
        }}
        className={`rounded border px-3 py-1.5 text-xs font-medium ${
          perigo
            ? "border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
            : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        }`}
      >
        {rotulo}
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg">
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {rotulo}
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{pergunta}</p>
            {erro && <p className="mb-3 text-xs text-red-600 dark:text-red-400">{erro}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={confirmar}
                disabled={enviando}
                className={`rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
                  perigo
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600"
                }`}
              >
                {confirmarRotulo}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
