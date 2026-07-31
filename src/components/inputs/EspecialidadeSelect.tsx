"use client";

import { useEffect, useRef, useState } from "react";
import { ESPECIALIDADES_PRESTADOR } from "@/lib/labels";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export default function EspecialidadeSelect({
  name,
  defaultValue,
  required,
  className,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
}) {
  const opcoes =
    defaultValue && !ESPECIALIDADES_PRESTADOR.includes(defaultValue)
      ? [defaultValue, ...ESPECIALIDADES_PRESTADOR]
      : ESPECIALIDADES_PRESTADOR;

  const [valor, setValor] = useState(defaultValue ?? "");
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={valor} required={required} />
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className={`${className ?? CAMPO_CLASSE} flex items-center justify-between text-left`}
      >
        <span className={valor ? "" : "text-slate-400 dark:text-slate-500"}>
          {valor || "Selecione uma especialidade"}
        </span>
        <span className="ml-2 text-slate-400">▾</span>
      </button>

      {aberto && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-lg">
          {opcoes.map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => {
                setValor(opcao);
                setAberto(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {opcao}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
