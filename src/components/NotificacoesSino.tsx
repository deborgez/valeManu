"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  marcarNotificacaoLida,
  marcarTodasNotificacoesLidas,
} from "@/app/notificacoes/actions";

type Item = {
  id: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  quando: string;
};

export default function NotificacoesSino({
  itens,
  naoLidas,
}: {
  itens: Item[];
  naoLidas: number;
}) {
  const [aberto, setAberto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const intervalo = setInterval(() => router.refresh(), 60000);
    return () => clearInterval(intervalo);
  }, [router]);

  async function abrir(item: Item) {
    if (!item.lida) await marcarNotificacaoLida(item.id);
    setAberto(false);
    if (item.link) router.push(item.link);
    router.refresh();
  }

  async function marcarTodas() {
    await marcarTodasNotificacoesLidas();
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        title="Notificações"
        aria-label="Notificações"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {naoLidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {naoLidas > 99 ? "99+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setAberto(false)} />
          <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Notificações
              </p>
              {naoLidas > 0 && (
                <button
                  type="button"
                  onClick={marcarTodas}
                  className="text-xs text-slate-500 underline dark:text-slate-400"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <ul className="max-h-96 overflow-y-auto">
              {itens.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => abrir(item)}
                    className={`block w-full border-b border-slate-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700 ${
                      item.lida
                        ? "text-slate-500 dark:text-slate-400"
                        : "bg-blue-50/60 font-medium text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                    }`}
                  >
                    <span className="block">{item.mensagem}</span>
                    <span className="mt-0.5 block text-xs font-normal text-slate-400 dark:text-slate-500">
                      {item.quando}
                    </span>
                  </button>
                </li>
              ))}
              {itens.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                  Nenhuma notificação.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
