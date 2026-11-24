"use client";

import { type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Aba = {
  id: string;
  label: string;
  content: ReactNode;
};

export default function AbasDistrato({ abas }: { abas: Aba[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const abaParam = searchParams.get("aba");
  const abaAtiva = abas.some((a) => a.id === abaParam) ? abaParam : abas[0]?.id;

  function selecionarAba(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("aba", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <div className="mb-6 inline-flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {abas.map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => selecionarAba(aba.id)}
            className={
              aba.id === abaAtiva
                ? "rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-sm"
                : "rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            }
          >
            {aba.label}
          </button>
        ))}
      </div>

      {abas.map((aba) => (
        <div key={aba.id} className={aba.id === abaAtiva ? "" : "hidden"}>
          {aba.content}
        </div>
      ))}
    </div>
  );
}
