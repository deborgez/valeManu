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
      <div className="mb-6 flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {abas.map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => selecionarAba(aba.id)}
            className={
              aba.id === abaAtiva
                ? "border-b-2 border-slate-900 dark:border-slate-100 px-4 py-2 text-sm font-medium text-slate-900 dark:text-slate-100"
                : "border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
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
