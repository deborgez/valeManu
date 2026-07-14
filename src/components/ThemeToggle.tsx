"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("theme-change", callback);
  return () => window.removeEventListener("theme-change", callback);
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function alternar() {
    const proximo = !isDark;
    document.documentElement.classList.toggle("dark", proximo);
    localStorage.setItem("theme", proximo ? "dark" : "light");
    // Força o useSyncExternalStore a reler o DOM na próxima renderização.
    window.dispatchEvent(new Event("theme-change"));
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label="Alternar tema claro/escuro"
      className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
    >
      {isDark ? "🌙 Escuro" : "☀️ Claro"}
    </button>
  );
}
