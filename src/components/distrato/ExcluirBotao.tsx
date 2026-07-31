"use client";

import { useState } from "react";

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
        disabled={excluindo}
        className="text-xs text-red-600 dark:text-red-400 underline disabled:opacity-50"
      >
        Excluir
      </button>
    </form>
  );
}
