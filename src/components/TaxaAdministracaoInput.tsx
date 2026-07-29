"use client";

import { useState } from "react";
import { formatMoedaExibicao } from "@/lib/masks";

export default function TaxaAdministracaoInput({
  valorMaoDeObra,
  valorMaterial,
  percentualInicial,
}: {
  valorMaoDeObra: number | null;
  valorMaterial: number | null;
  percentualInicial: number;
}) {
  const [percentual, setPercentual] = useState(percentualInicial);

  const subtotal = (valorMaoDeObra ?? 0) + (valorMaterial ?? 0);
  const taxa = subtotal * (percentual / 100);
  const total = subtotal + taxa;

  return (
    <div className="mt-2 flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
          Taxa de administração (%)
        </label>
        <input
          type="number"
          name="percentualAdministracao"
          step="0.01"
          min="0"
          value={percentual}
          onChange={(e) => setPercentual(Number(e.target.value) || 0)}
          className="w-24 rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Taxa: R$ {formatMoedaExibicao(taxa)} · Total: R$ {formatMoedaExibicao(total)}
      </p>
    </div>
  );
}
