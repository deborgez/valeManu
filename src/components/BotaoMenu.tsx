"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BotaoMenu() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.remove("menu-aberto");
  }, [pathname]);

  return (
    <button
      type="button"
      aria-label="Abrir menu"
      onClick={() => document.body.classList.toggle("menu-aberto")}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 md:hidden"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        className="h-5 w-5"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  );
}
