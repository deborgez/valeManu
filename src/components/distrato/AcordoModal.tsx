"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MoedaInput from "@/components/inputs/MoedaInput";
import { formatMoedaExibicao, parseMoeda } from "@/lib/masks";
import { IconeEditar } from "./icones";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

type Registro = {
  valorOriginal: number;
  tipoDesconto: "PERCENTUAL" | "VALOR" | null;
  valorDesconto: number;
  numeroParcelas: number;
  primeiraParcela: string;
  observacoes: string | null;
};

export default function AcordoModal({
  action,
  registro,
  valorSugerido,
}: {
  action: (formData: FormData) => Promise<void>;
  registro?: Registro | null;
  /** Valor total em aberto (lançamentos + adequações + multa) sugerido como ponto de partida. */
  valorSugerido?: number;
}) {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [valorOriginal, setValorOriginal] = useState(
    registro?.valorOriginal ?? valorSugerido ?? 0
  );
  const [tipoDesconto, setTipoDesconto] = useState<"" | "PERCENTUAL" | "VALOR">(
    registro?.tipoDesconto ?? ""
  );
  const [valorDesconto, setValorDesconto] = useState(registro?.valorDesconto ?? 0);
  const [numeroParcelas, setNumeroParcelas] = useState(registro?.numeroParcelas ?? 1);

  const router = useRouter();

  const valorFinal =
    tipoDesconto === "PERCENTUAL"
      ? Math.max(valorOriginal * (1 - valorDesconto / 100), 0)
      : tipoDesconto === "VALOR"
        ? Math.max(valorOriginal - valorDesconto, 0)
        : valorOriginal;
  const valorParcela = numeroParcelas > 0 ? valorFinal / numeroParcelas : 0;

  function abrir() {
    if (!registro) {
      setValorOriginal(valorSugerido ?? 0);
      setTipoDesconto("");
      setValorDesconto(0);
      setNumeroParcelas(1);
    }
    setAberto(true);
  }

  return (
    <>
      {registro ? (
        <button
          type="button"
          onClick={abrir}
          title="Editar"
          className="rounded border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <IconeEditar />
        </button>
      ) : (
        <button
          type="button"
          onClick={abrir}
          className="w-fit rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Registrar Acordo
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
            className="w-full max-w-md rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
          >
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {registro ? "Editar Acordo" : "Registrar Acordo"}
            </h3>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Valor Original (R$)
              </label>
              <MoedaInput
                name="valorOriginal"
                required
                defaultValue={valorOriginal}
                onValueChange={(v) => setValorOriginal(parseMoeda(v))}
                className={CAMPO_CLASSE}
              />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Desconto
                </label>
                <select
                  name="tipoDesconto"
                  value={tipoDesconto}
                  onChange={(e) => setTipoDesconto(e.target.value as "" | "PERCENTUAL" | "VALOR")}
                  className={CAMPO_CLASSE}
                >
                  <option value="">Sem desconto</option>
                  <option value="PERCENTUAL">Percentual (%)</option>
                  <option value="VALOR">Valor (R$)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {tipoDesconto === "PERCENTUAL" ? "Desconto (%)" : "Desconto (R$)"}
                </label>
                {tipoDesconto === "VALOR" ? (
                  <MoedaInput
                    name="valorDesconto"
                    defaultValue={valorDesconto}
                    onValueChange={(v) => setValorDesconto(parseMoeda(v))}
                    className={CAMPO_CLASSE}
                  />
                ) : (
                  <input
                    type="number"
                    name="valorDesconto"
                    min="0"
                    step="0.01"
                    value={valorDesconto}
                    onChange={(e) => setValorDesconto(parseFloat(e.target.value) || 0)}
                    disabled={tipoDesconto === ""}
                    className={`${CAMPO_CLASSE} disabled:opacity-50`}
                  />
                )}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Número de Parcelas
                </label>
                <input
                  type="number"
                  name="numeroParcelas"
                  min="1"
                  required
                  value={numeroParcelas}
                  onChange={(e) => setNumeroParcelas(Math.max(parseInt(e.target.value, 10) || 1, 1))}
                  className={CAMPO_CLASSE}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  1ª Parcela — Vencimento
                </label>
                <input
                  type="date"
                  name="primeiraParcela"
                  required
                  defaultValue={registro?.primeiraParcela}
                  className={CAMPO_CLASSE}
                />
              </div>
            </div>

            <div className="mb-4 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-sm">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Valor final: R$ {formatMoedaExibicao(valorFinal)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {numeroParcelas}x de R$ {formatMoedaExibicao(valorParcela)}
              </p>
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Observações
              </label>
              <textarea
                name="observacoes"
                rows={3}
                defaultValue={registro?.observacoes ?? ""}
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
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
