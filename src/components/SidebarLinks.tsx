"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ICONES: Record<string, ReactNode> = {
  grade: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  arquivo: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </>
  ),
  ferramenta: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  usuarios: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  casa: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </>
  ),
  grafico: (
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </>
  ),
  mais: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ),
  livro: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  prancheta: (
    <>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </>
  ),
  caixa: (
    <>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </>
  ),
  predio: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
    </>
  ),
};

const ICONE_POR_ROTA: Record<string, string> = {
  "/": "casa",
  "/cadastro": "arquivo",
  "/prestadores": "ferramenta",
  "/manutencoes": "grade",
  "/relatorios": "grafico",
  "/distrato/novo": "mais",
  "/distrato": "arquivo",
  "/distrato/relatorios": "grafico",
  "/juridico": "livro",
  "/vistorias/solicitacoes": "caixa",
  "/vistorias/entrada": "prancheta",
  "/vistorias/saida": "prancheta",
  "/vistorias/relatorios": "grafico",
  "/configuracoes": "predio",
  "/usuarios": "usuarios",
  "/configuracoes/limpeza": "arquivo",
};

export default function SidebarLinks({
  links,
}: {
  links: { href: string; label: string; badge?: number }[];
}) {
  const pathname = usePathname();

  const linkAtivo = links
    .filter((link) =>
      link.href === "/"
        ? pathname === "/"
        : pathname === link.href || pathname.startsWith(`${link.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <div className="flex flex-col gap-0.5">
      {links.map((link) => {
        const ativo = link.href === linkAtivo?.href;
        const icone = ICONES[ICONE_POR_ROTA[link.href] ?? "arquivo"];
        return (
          <Link
            key={link.href}
            href={link.href}
            title={link.label}
            className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              ativo
                ? "bg-[var(--sidebar-ativo)] font-medium text-white"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[18px] w-[18px] shrink-0"
            >
              {icone}
            </svg>
            <span className="rotulo-menu flex-1 whitespace-nowrap">{link.label}</span>
            {link.badge ? (
              <span className="badge-menu rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {link.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
