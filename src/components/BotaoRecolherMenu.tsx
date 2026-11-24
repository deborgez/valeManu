"use client";

export default function BotaoRecolherMenu() {
  function alternar() {
    const recolhido = document.documentElement.classList.toggle("menu-recolhido");
    try {
      localStorage.setItem("menu-recolhido", recolhido ? "1" : "0");
    } catch {
      // sem armazenamento disponível: o estado vale só nesta visita
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      title="Recolher ou expandir o menu"
      aria-label="Recolher ou expandir o menu"
      className="botao-recolher hidden h-7 w-7 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white md:flex"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 transition-transform"
      >
        <polyline points="11 17 6 12 11 7" />
        <polyline points="18 17 13 12 18 7" />
      </svg>
    </button>
  );
}
