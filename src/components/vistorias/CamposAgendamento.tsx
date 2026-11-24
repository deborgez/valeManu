"use client";

import { useState } from "react";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

const OPCOES = [
  { valor: "agora", rotulo: "Solicitar agora" },
  { valor: "agendar", rotulo: "Agendar" },
] as const;

export default function CamposAgendamento({ hoje }: { hoje: string }) {
  const [modo, setModo] = useState<"agora" | "agendar">("agora");

  return (
    <fieldset className="mb-4">
      <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        Quando será a vistoria?
      </legend>

      <div className="grid grid-cols-2 gap-2">
        {OPCOES.map((opcao) => {
          const ativa = modo === opcao.valor;
          return (
            <label
              key={opcao.valor}
              className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                ativa
                  ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)] dark:text-blue-200"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <input
                type="radio"
                name="agendamento"
                value={opcao.valor}
                checked={ativa}
                onChange={() => setModo(opcao.valor)}
                className="sr-only"
              />
              {opcao.rotulo}
            </label>
          );
        })}
      </div>

      {modo === "agendar" && (
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Data
            </label>
            <input type="date" name="dataAgendada" required min={hoje} className={CAMPO_CLASSE} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Horário (opcional)
            </label>
            <input type="time" name="horaAgendada" className={CAMPO_CLASSE} />
          </div>
        </div>
      )}
    </fieldset>
  );
}
