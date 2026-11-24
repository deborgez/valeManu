import type { ReactNode } from "react";

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const ICONES: Record<string, ReactNode> = {
  cano: (
    <>
      <path d="M3 7h10a4 4 0 0 1 4 4v10" />
      <path d="M3 4.5v5" />
      <path d="M14.5 21h5" />
      <path d="M19 3c1.4 1.9 2.4 3 2.4 4.3a2.4 2.4 0 0 1-4.8 0C16.6 6 17.6 4.9 19 3z" />
    </>
  ),
  raio: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  madeira: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10c2 0 2 2 4 2s2-2 4-2 2 2 4 2" />
      <path d="M7 15c2 0 2 1 4 1" />
      <path d="M16 15.5h1" />
    </>
  ),
  rolo: (
    <>
      <rect x="3" y="3" width="14" height="6" rx="1.5" />
      <path d="M17 6h3v5h-9v4" />
      <rect x="9" y="15" width="4" height="6" rx="1" />
    </>
  ),
  tijolos: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M3 9.3h18M3 14.7h18M9 4v5.3M15 9.3v5.4M9 14.7V20" />
    </>
  ),
  camadas: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
  cadeado: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  chave: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9" />
      <path d="M16 7l3 3" />
    </>
  ),
  janela: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M12 3v18M4 12h16" />
      <path d="M7 6l2 2" />
    </>
  ),
  piso: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 21L21 3M3 12L12 3M12 21l9-9" />
    </>
  ),
  guardachuva: (
    <>
      <path d="M4 12a8 8 0 0 1 16 0z" />
      <path d="M12 12v6a2 2 0 0 0 4 0" />
    </>
  ),
  folha: (
    <>
      <path d="M11 20A7 7 0 0 1 4 13c0-6 7-9 15-9 0 8-3 15-8 16z" />
      <path d="M4 21c3-6 6-9 10-11" />
    </>
  ),
  brilho: (
    <>
      <path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
      <path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </>
  ),
  floco: (
    <>
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="19.1" y2="19.1" />
      <line x1="19.1" y1="4.9" x2="4.9" y2="19.1" />
    </>
  ),
  escudo: (
    <>
      <path d="M12 2L4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  inseto: (
    <>
      <rect x="8" y="6" width="8" height="14" rx="4" />
      <path d="M12 6V3M8 10H4M8 14H4M8 18l-3 2M16 10h4M16 14h4M16 18l3 2M9 3l3 3 3-3" />
    </>
  ),
  ondas: (
    <>
      <path d="M2 15c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0" />
      <path d="M2 20c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0" />
      <path d="M8 11V4a2 2 0 0 1 4 0M14 11V6" />
    </>
  ),
  chama: (
    <path d="M12 22c4 0 7-3 7-7 0-3-2-5-3.5-7-1 2-2.5 3-3.5 3 0-3-1-6-3-9-.5 3-2 5-3 7-1 2-1 3-1 6 0 4 3 7 7 7z" />
  ),
  laudo: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 15l2 2 4-4" />
    </>
  ),
  ferramenta: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
};

const REGRAS: { palavras: string[]; icone: keyof typeof ICONES }[] = [
  { palavras: ["segur"], icone: "escudo" },
  { palavras: ["hidraul", "encanad", "poco"], icone: "cano" },
  { palavras: ["eletric"], icone: "raio" },
  { palavras: ["marcen", "carpint", "madeir"], icone: "madeira" },
  { palavras: ["pint"], icone: "rolo" },
  { palavras: ["alvenar", "pedreir"], icone: "tijolos" },
  { palavras: ["gesso", "drywall"], icone: "camadas" },
  { palavras: ["serralh"], icone: "cadeado" },
  { palavras: ["chaveir"], icone: "chave" },
  { palavras: ["vidrac", "vidro"], icone: "janela" },
  { palavras: ["piso", "revest"], icone: "piso" },
  { palavras: ["cobert", "imperme", "telhad"], icone: "guardachuva" },
  { palavras: ["jardin", "paisag"], icone: "folha" },
  { palavras: ["limpez"], icone: "brilho" },
  { palavras: ["climat", "refriger", "ar condicionado"], icone: "floco" },
  { palavras: ["praga"], icone: "inseto" },
  { palavras: ["piscin"], icone: "ondas" },
  { palavras: ["gas"], icone: "chama" },
  { palavras: ["engenh", "laudo"], icone: "laudo" },
];

export default function IconeEspecialidade({
  nome,
  className = "h-5 w-5",
}: {
  nome: string;
  className?: string;
}) {
  const alvo = normalizar(nome);
  const regra = REGRAS.find((r) => r.palavras.some((p) => alvo.includes(p)));
  const icone = ICONES[regra?.icone ?? "ferramenta"];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {icone}
    </svg>
  );
}
