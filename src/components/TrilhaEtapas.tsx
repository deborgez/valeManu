import { ETAPAS_TRILHA } from "@/lib/trilha";

export default function TrilhaEtapas({ etapaAtual }: { etapaAtual: number }) {
  return (
    <div className="mb-6 flex items-start">
      {ETAPAS_TRILHA.map((etapa, i) => {
        const concluida = i < etapaAtual;
        const atual = i === etapaAtual;
        return (
          <div key={etapa} className="contents">
            <div className="flex shrink-0 flex-col items-center">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  concluida
                    ? "bg-green-600 text-white"
                    : atual
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                }`}
              >
                {concluida ? "✓" : i + 1}
              </div>
              <p
                className={`mt-1 w-20 text-center text-[10px] leading-tight ${
                  atual
                    ? "font-semibold text-slate-900 dark:text-slate-100"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {etapa}
              </p>
            </div>
            {i < ETAPAS_TRILHA.length - 1 && (
              <div
                className={`mt-3.5 h-0.5 flex-1 ${
                  concluida ? "bg-green-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
