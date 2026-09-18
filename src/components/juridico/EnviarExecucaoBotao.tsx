"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EnviarExecucaoBotao({
  action,
}: {
  action: () => Promise<void>;
}) {
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!confirm("Enviar este processo para a fase de Execução?")) return;
        setEnviando(true);
        await action();
        router.refresh();
        setEnviando(false);
      }}
    >
      <button
        type="submit"
        disabled={enviando}
        className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
      >
        Enviar para Execução
      </button>
    </form>
  );
}
