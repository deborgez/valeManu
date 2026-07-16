"use client";

import { useState, type ReactNode } from "react";

export default function RevelarConteudo({
  rotulo,
  children,
}: {
  rotulo: string;
  children: ReactNode;
}) {
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-xs text-slate-500 dark:text-slate-400 underline"
      >
        {rotulo}
      </button>
    );
  }

  return <div className="mt-3">{children}</div>;
}
