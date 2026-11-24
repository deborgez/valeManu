"use client";

import { useRouter } from "next/navigation";
import { marcarNotificacaoLida } from "@/app/notificacoes/actions";

export default function NotificacaoLinha({
  id,
  mensagem,
  link,
  lida,
  quando,
  categoria,
}: {
  id: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  quando: string;
  categoria: string;
}) {
  const router = useRouter();

  async function abrir() {
    if (!lida) await marcarNotificacaoLida(id);
    if (link) router.push(link);
    else router.refresh();
  }

  return (
    <li>
      <button
        type="button"
        onClick={abrir}
        className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700 ${
          lida
            ? "text-slate-500 dark:text-slate-400"
            : "bg-blue-50/50 font-medium text-slate-900 dark:bg-slate-900 dark:text-slate-100"
        }`}
      >
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${lida ? "bg-transparent" : "bg-[var(--accent)]"}`}
        />
        <span className="flex-1">
          <span className="block">{mensagem}</span>
          <span className="mt-0.5 block text-xs font-normal text-slate-400 dark:text-slate-500">
            {categoria} · {quando}
          </span>
        </span>
      </button>
    </li>
  );
}
