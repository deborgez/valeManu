"use client";

import { useState } from "react";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export default function CamposAgendamento({ hoje }: { hoje: string }) {
  const [modo, setModo] = useState<"agora" | "agendar">("agora");

  return (
    <fieldset className="mb-4">
      <legend className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        Quando será a vistoria?
      </legend>
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="radio"
          name="agendamento"
          value="agora"
          checked={modo === "agora"}
          onChange={() => setModo("agora")}
          className="h-4 w-4"
        />
        Solicitar agora (o prazo conta a partir de hoje)
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="radio"
          name="agendamento"
          value="agendar"
          checked={modo === "agendar"}
          onChange={() => setModo("agendar")}
          className="h-4 w-4"
        />
        Agendar para uma data (o prazo conta a partir da data agendada)
      </label>

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
