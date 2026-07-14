"use client";

import Link from "next/link";
import { useState } from "react";
import type { Severidade } from "@/lib/tempo";

type ItemManutencao = {
  id: string;
  numeroProcesso: string;
  endereco: string;
  natureza: string;
  emergencial: boolean;
  severidade: Severidade;
};

type Etapa = {
  titulo: string;
  itens: ItemManutencao[];
};

const SELO_COR: Record<Exclude<Severidade, "neutro">, string> = {
  verde: "bg-green-500 text-white",
  amarelo: "bg-amber-400 text-amber-950",
  vermelho: "bg-red-500 text-white",
};

function contarPorSeveridade(itens: ItemManutencao[]) {
  const contagem: Record<Exclude<Severidade, "neutro">, number> = {
    verde: 0,
    amarelo: 0,
    vermelho: 0,
  };
  for (const item of itens) {
    if (item.severidade !== "neutro") contagem[item.severidade] += 1;
  }
  return contagem;
}

export default function PainelEtapas({ etapas }: { etapas: Etapa[] }) {
  const [etapaAberta, setEtapaAberta] = useState<Etapa | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
        {etapas.map((etapa) => {
          const contagem = contarPorSeveridade(etapa.itens);
          const emergenciais = etapa.itens.filter((i) => i.emergencial).length;

          return (
            <button
              key={etapa.titulo}
              type="button"
              onClick={() => setEtapaAberta(etapa)}
              className="flex flex-col items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-3 text-center hover:border-slate-400 dark:hover:border-slate-500"
            >
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {etapa.itens.length}
              </p>
              <p className="flex min-h-[2rem] items-center text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                {etapa.titulo}
              </p>
              <div className="mt-2 flex h-5 items-center justify-center gap-1">
                {(["verde", "amarelo", "vermelho"] as const).map(
                  (cor) =>
                    contagem[cor] > 0 && (
                      <span
                        key={cor}
                        className={`flex h-5 w-5 items-center justify-center rounded text-xs font-bold ${SELO_COR[cor]}`}
                      >
                        {contagem[cor]}
                      </span>
                    )
                )}
                {emergenciais > 0 && (
                  <span
                    className="flex h-5 items-center justify-center gap-0.5 rounded bg-red-600 px-1 text-xs font-bold text-white"
                    title="Manutenções emergenciais"
                  >
                    🚨{emergenciais}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {etapaAberta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setEtapaAberta(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {etapaAberta.titulo} ({etapaAberta.itens.length})
              </h3>
              <button
                type="button"
                onClick={() => setEtapaAberta(null)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {etapaAberta.itens.map((item) => (
                <Link
                  key={item.id}
                  href={`/manutencoes/${item.id}`}
                  className="block rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm hover:border-slate-300 dark:hover:border-slate-600"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {item.severidade !== "neutro" && (
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          item.severidade === "verde"
                            ? "bg-green-500"
                            : item.severidade === "amarelo"
                              ? "bg-amber-400"
                              : "bg-red-500"
                        }`}
                      />
                    )}
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {item.numeroProcesso}
                    </p>
                    {item.emergencial && (
                      <span className="shrink-0 rounded bg-red-100 dark:bg-red-900 px-1 py-0.5 text-[9px] font-bold uppercase text-red-700 dark:text-red-400">
                        Emergencial
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.endereco} · {item.natureza}
                  </p>
                </Link>
              ))}
              {etapaAberta.itens.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Nenhuma manutenção nesta etapa.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
