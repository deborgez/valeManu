"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function TipoMultaSelector({
  infracaoContratual,
  action,
}: {
  infracaoContratual: boolean;
  action: (infracao: boolean) => Promise<void>;
}) {
  const [valor, setValor] = useState(infracaoContratual);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function selecionar(infracao: boolean) {
    if (infracao === valor || pending) return;
    setValor(infracao);
    startTransition(async () => {
      await action(infracao);
      router.refresh();
    });
  }

  const BASE =
    "rounded border px-3 py-1.5 text-xs font-medium disabled:opacity-60";
  const ATIVO =
    "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900";
  const INATIVO =
    "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700";

  return (
    <div className="mb-3 flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => selecionar(false)}
        className={`${BASE} ${!valor ? ATIVO : INATIVO}`}
      >
        Distrato
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => selecionar(true)}
        className={`${BASE} ${valor ? ATIVO : INATIVO}`}
      >
        Infração Contratual
      </button>
    </div>
  );
}
