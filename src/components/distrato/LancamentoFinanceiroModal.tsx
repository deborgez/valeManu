"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MoedaInput from "@/components/inputs/MoedaInput";
import { IconeEditar } from "./icones";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

type Registro = {
  subtipo: "CONTA" | "SERVICO" | null;
  nomeServico: string | null;
  mesCompetencia: string;
  periodoDias: number | null;
  valor: number;
};

function diasNoMes(mesCompetencia: string): number | null {
  const [anoStr, mesStr] = mesCompetencia.split("-");
  const ano = parseInt(anoStr, 10);
  const mes = parseInt(mesStr, 10);
  if (!ano || !mes) return null;
  return new Date(ano, mes, 0).getDate();
}

export default function LancamentoFinanceiroModal({
  titulo,
  botaoLabel,
  action,
  registro,
  valorBaseCalculo,
  permiteServico = false,
}: {
  titulo: string;
  botaoLabel?: string;
  action: (formData: FormData) => Promise<void>;
  registro?: Registro | null;
  /** Valor mensal cheio (ex.: aluguel atual) usado para calcular o valor proporcional pelo período. */
  valorBaseCalculo?: number | null;
  /** Permite escolher entre lançamento de Conta (competência/período/valor) ou Serviço (nome/competência/valor). */
  permiteServico?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [subtipo, setSubtipo] = useState<"CONTA" | "SERVICO">(
    registro?.subtipo === "SERVICO" ? "SERVICO" : "CONTA"
  );
  const [mesCompetencia, setMesCompetencia] = useState(registro?.mesCompetencia ?? "");
  const [periodoDias, setPeriodoDias] = useState(
    registro?.periodoDias != null ? String(registro.periodoDias) : ""
  );
  const [valorCalculado, setValorCalculado] = useState<number | undefined>(
    registro?.valor
  );
  const [resetKey, setResetKey] = useState(0);
  const router = useRouter();

  function recalcular(mes: string, periodo: string) {
    if (!valorBaseCalculo) return;
    const dias = diasNoMes(mes);
    const periodoNum = parseInt(periodo, 10);
    if (!dias || !periodoNum) return;
    const valor = Math.round(((valorBaseCalculo / dias) * periodoNum) * 100) / 100;
    setValorCalculado(valor);
  }

  function abrirParaNovoLancamento() {
    setSubtipo("CONTA");
    setMesCompetencia("");
    setPeriodoDias("");
    setValorCalculado(undefined);
    setResetKey((atual) => atual + 1);
    setAberto(true);
  }

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
          onClick={abrirParaNovoLancamento}
          className="w-fit rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          {botaoLabel ?? "Novo Lançamento"}
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
              {registro ? `Editar ${titulo}` : titulo}
            </h3>

            {permiteServico && (
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tipo
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSubtipo("CONTA")}
                    className={`rounded border px-3 py-1.5 text-xs font-medium ${
                      subtipo === "CONTA"
                        ? "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                        : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubtipo("SERVICO")}
                    className={`rounded border px-3 py-1.5 text-xs font-medium ${
                      subtipo === "SERVICO"
                        ? "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                        : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    Serviço
                  </button>
                </div>
                <input type="hidden" name="subtipo" value={subtipo} />
              </div>
            )}

            {subtipo === "SERVICO" && (
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nome do Serviço
                </label>
                <input
                  key={resetKey}
                  type="text"
                  name="nomeServico"
                  required
                  placeholder="Ex.: Corte"
                  defaultValue={registro?.nomeServico ?? ""}
                  className={CAMPO_CLASSE}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mês de Competência
              </label>
              <input
                type="month"
                name="mesCompetencia"
                required
                value={mesCompetencia}
                onChange={(e) => {
                  setMesCompetencia(e.target.value);
                  recalcular(e.target.value, periodoDias);
                }}
                className={CAMPO_CLASSE}
              />
            </div>

            {subtipo === "CONTA" && (
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Período (dias)
                </label>
                <input
                  type="number"
                  name="periodoDias"
                  min="1"
                  max="31"
                  value={periodoDias}
                  onChange={(e) => {
                    const bruto = e.target.value;
                    const valor = bruto === "" ? "" : String(Math.min(parseInt(bruto, 10) || 0, 31));
                    setPeriodoDias(valor);
                    recalcular(mesCompetencia, valor);
                  }}
                  className={CAMPO_CLASSE}
                />
                {valorBaseCalculo && (
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Preenchendo o período, o valor é calculado automaticamente pelos dias do mês.
                  </p>
                )}
              </div>
            )}

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Valor (R$)
              </label>
              <MoedaInput
                key={`${resetKey}-${valorCalculado ?? "vazio"}`}
                name="valor"
                required
                defaultValue={valorCalculado}
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
