"use client";

import { useState } from "react";
import TelefoneInput from "./TelefoneInput";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export default function FiancaFields() {
  const [tipo, setTipo] = useState("FIADOR");

  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Tipo de Fiança
      </label>
      <select
        name="tipoFianca"
        required
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className={`${CAMPO_CLASSE} mb-4`}
      >
        <option value="FIADOR">Fiador</option>
        <option value="SEGURO_FIANCA">Seguro Fiança</option>
        <option value="FIANCA_ONEROSA">Fiança Onerosa</option>
      </select>

      <div className={tipo === "FIADOR" ? "grid grid-cols-2 gap-4" : ""}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Nome
          </label>
          <input name="fiancaNome" required className={CAMPO_CLASSE} />
        </div>
        {tipo === "FIADOR" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Telefone
            </label>
            <TelefoneInput name="fiancaTelefone" required className={CAMPO_CLASSE} />
          </div>
        )}
      </div>
    </div>
  );
}
