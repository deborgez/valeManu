"use client";

import { useState } from "react";
import { IconeExcluir } from "./icones";

export default function ExcluirBotao({
  onExcluir,
}: {
  onExcluir: () => Promise<void>;
}) {
  const [excluindo, setExcluindo] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!confirm("Excluir este registro? Essa ação não pode ser desfeita.")) return;
        setExcluindo(true);
        await onExcluir();
      }}
    >
      <button
        type="submit"
        title="Excluir"
        disabled={excluindo}
        className="rounded border border-slate-200 dark:border-slate-700 p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
      >
        <IconeExcluir />
      </button>
    </form>
  );
}
