"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelarManutencaoBotao({
  onConfirmar,
}: {
  onConfirmar: (motivo: string) => Promise<void>;
}) {
  const [etapa, setEtapa] = useState<"fechado" | "motivo" | "confirmar">("fechado");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  const motivoPreenchido = motivo.trim().length > 0;

  function abrir() {
    setMotivo("");
    setErro(null);
    setEtapa("motivo");
  }

  async function confirmar() {
    if (enviando || !motivoPreenchido) return;
    setEnviando(true);
    setErro(null);
    try {
      await onConfirmar(motivo.trim());
      setEtapa("fechado");
      router.refresh();
    } catch {
      setErro("Não foi possível cancelar a manutenção. Tente novamente.");
      setEtapa("motivo");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="rounded border border-red-300 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
      >
        Cancelar manutenção
      </button>

      {etapa !== "fechado" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg">
            {etapa === "motivo" ? (
              <>
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Cancelar manutenção
                </h3>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  Ela será fechada na etapa em que está, os prazos deixam de contar e o card vai
                  para a coluna Canceladas. Você poderá reabri-la depois.
                </p>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Motivo do cancelamento
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                  required
                  autoFocus
                  placeholder="Descreva por que a manutenção está sendo cancelada"
                  className="mb-4 w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
                />
                {erro && <p className="mb-3 text-xs text-red-600 dark:text-red-400">{erro}</p>}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEtapa("fechado")}
                    className="rounded px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    disabled={!motivoPreenchido}
                    onClick={() => setEtapa("confirmar")}
                    className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Cancelar manutenção
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Confirmar cancelamento
                </h3>
                <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                  Tem certeza de que deseja cancelar esta manutenção?
                </p>
                <p className="mb-4 whitespace-pre-line rounded bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-xs text-slate-400 dark:text-slate-500">Motivo: </span>
                  {motivo.trim()}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEtapa("motivo")}
                    disabled={enviando}
                    className="rounded px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={confirmar}
                    disabled={enviando}
                    className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    Sim, cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
