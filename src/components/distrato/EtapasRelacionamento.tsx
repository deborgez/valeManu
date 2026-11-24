type Etapa = { rotulo: string; concluida: boolean };

export default function EtapasRelacionamento({ etapas }: { etapas: Etapa[] }) {
  const indiceAtual = etapas.findIndex((e) => !e.concluida);

  return (
    <section className="mb-6 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <ol className="flex min-w-max items-start">
        {etapas.map((etapa, i) => {
          const atual = i === indiceAtual;
          return (
            <li key={etapa.rotulo} className="flex items-start">
              <div className="flex w-24 flex-col items-center text-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    etapa.concluida
                      ? "bg-green-500 text-white"
                      : atual
                        ? "bg-[var(--accent)] text-white ring-4 ring-[color-mix(in_srgb,var(--accent)_25%,transparent)]"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                  }`}
                >
                  {etapa.concluida ? "✓" : i + 1}
                </span>
                <span
                  className={`mt-1.5 text-[11px] leading-tight ${
                    atual
                      ? "font-semibold text-slate-900 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {etapa.rotulo}
                </span>
              </div>
              {i < etapas.length - 1 && (
                <div
                  className={`mt-4 h-0.5 w-6 ${
                    etapa.concluida ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
