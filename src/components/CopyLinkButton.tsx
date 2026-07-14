"use client";

import { useState } from "react";

export default function CopyLinkButton({ link }: { link: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(link);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }}
      className="rounded border border-slate-300 dark:border-slate-600 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
    >
      {copiado ? "Copiado!" : "Copiar link"}
    </button>
  );
}
