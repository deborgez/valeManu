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
  tipoJuros: "PERCENTUAL" | "VALOR" | null;
  valorJuros: number;
  jurosAoMes: boolean;
  numeroParcelas: number;
  primeiraParcela: string;
  observacoes: string | null;
};

type ItemCusto = { id: string; label: string; valor: number };

export default function AcordoModal({
  action,
  registro,
  itensDisponiveis,
}: {
  action: (formData: FormData) => Promise<void>;
  registro?: Registro | null;
  /** Custos em aberto (lançamentos, adequações, multa) que o usuário escolhe incluir no acordo. Só usado ao criar. */
  itensDisponiveis?: ItemCusto[];
}) {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const usaSelecaoDeItens = !registro && (itensDisponiveis?.length ?? 0) > 0;

  const [itensSelecionados, setItensSelecionados] = useState<string[]>(
    () => itensDisponiveis?.map((i) => i.id) ?? []
  );
  const valorOriginalPorSelecao = (itensDisponiveis ?? [])
    .filter((i) => itensSelecionados.includes(i.id))
    .reduce((soma, i) => soma + i.valor, 0);

  const [valorOriginalManual, setValorOriginalManual] = useState(
    registro?.valorOriginal ?? 0
  );
  const valorOriginal = usaSelecaoDeItens ? valorOriginalPorSelecao : valorOriginalManual;

  const [tipoDesconto, setTipoDesconto] = useState<"" | "PERCENTUAL" | "VALOR">(
    registro?.tipoDesconto ?? ""
  );
  const [valorDesconto, setValorDesconto] = useState(registro?.valorDesconto ?? 0);
  const [tipoJuros, setTipoJuros] = useState<"" | "PERCENTUAL" | "VALOR">(
    registro?.tipoJuros ?? ""
  );
  const [valorJuros, setValorJuros] = useState(registro?.valorJuros ?? 0);
  const [jurosAoMes, setJurosAoMes] = useState(registro?.jurosAoMes ?? false);
  const [numeroParcelas, setNumeroParcelas] = useState(registro?.numeroParcelas ?? 1);

  const router = useRouter();

  const valorComDesconto =
    tipoDesconto === "PERCENTUAL"
      ? valorOriginal * (1 - valorDesconto / 100)
      : tipoDesconto === "VALOR"
        ? valorOriginal - valorDesconto
        : valorOriginal;
  const multiplicadorJuros = jurosAoMes ? numeroParcelas : 1;
  const valorFinal = Math.max(
    tipoJuros === "PERCENTUAL"
      ? valorComDesconto * (1 + (valorJuros / 100) * multiplicadorJuros)
      : tipoJuros === "VALOR"
        ? valorComDesconto + valorJuros * multiplicadorJuros
        : valorComDesconto,
    0
  );
  const valorParcela = numeroParcelas > 0 ? valorFinal / numeroParcelas : 0;

  function abrir() {
    if (!registro) {
      setItensSelecionados(itensDisponiveis?.map((i) => i.id) ?? []);
      setValorOriginalManual(0);
      setTipoDesconto("");
      setValorDesconto(0);
      setTipoJuros("");
      setValorJuros(0);
      setJurosAoMes(false);
      setNumeroParcelas(1);
    }
    setAberto(true);
  }

  function alternarItem(id: string) {
    setItensSelecionados((atual) =>
      atual.includes(id) ? atual.filter((i) => i !== id) : [...atual, id]
    );
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
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
          >
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {registro ? "Editar Acordo" : "Registrar Acordo"}
            </h3>

            {usaSelecaoDeItens ? (
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Custos considerados no acordo
                </label>
                <div className="rounded border border-slate-300 dark:border-slate-600 divide-y divide-slate-100 dark:divide-slate-700">
                  {itensDisponiveis!.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={itensSelecionados.includes(item.id)}
                          onChange={() => alternarItem(item.id)}
                          className="h-4 w-4"
                        />
                        {item.label}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        R$ {formatMoedaExibicao(item.valor)}
                      </span>
                    </label>
                  ))}
                </div>
                <input type="hidden" name="valorOriginal" value={valorOriginal} />
                <p className="mt-2 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Total selecionado: R$ {formatMoedaExibicao(valorOriginal)}
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Valor Original (R$)
                </label>
                <MoedaInput
                  name="valorOriginal"
                  required
                  defaultValue={valorOriginalManual}
                  onValueChange={(v) => setValorOriginalManual(parseMoeda(v))}
                  className={CAMPO_CLASSE}
                />
              </div>
            )}

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

            <div className="mb-2 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Juros
                </label>
                <select
                  name="tipoJuros"
                  value={tipoJuros}
                  onChange={(e) => setTipoJuros(e.target.value as "" | "PERCENTUAL" | "VALOR")}
                  className={CAMPO_CLASSE}
                >
                  <option value="">Sem juros</option>
                  <option value="PERCENTUAL">Percentual (%)</option>
                  <option value="VALOR">Valor (R$)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {tipoJuros === "PERCENTUAL" ? "Juros (%)" : "Juros (R$)"}
                </label>
                {tipoJuros === "VALOR" ? (
                  <MoedaInput
                    name="valorJuros"
                    defaultValue={valorJuros}
                    onValueChange={(v) => setValorJuros(parseMoeda(v))}
                    className={CAMPO_CLASSE}
                  />
                ) : (
                  <input
                    type="number"
                    name="valorJuros"
                    min="0"
                    step="0.01"
                    value={valorJuros}
                    onChange={(e) => setValorJuros(parseFloat(e.target.value) || 0)}
                    disabled={tipoJuros === ""}
                    className={`${CAMPO_CLASSE} disabled:opacity-50`}
                  />
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  name="jurosAoMes"
                  checked={jurosAoMes}
                  onChange={(e) => setJurosAoMes(e.target.checked)}
                  disabled={tipoJuros === ""}
                  className="h-3.5 w-3.5 disabled:opacity-50"
                />
                Cobrar ao mês (aplica esse juros em cada parcela, não só uma vez)
              </label>
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
