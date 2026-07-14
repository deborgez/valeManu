import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sair } from "./actions";
import ThemeToggle from "./ThemeToggle";
import NavLinks from "./NavLinks";

export default async function NavBar() {
  const session = await auth();
  if (!session) return null;

  const imobiliaria = await prisma.imobiliaria.findUnique({
    where: { id: "singleton" },
    select: { nome: true, logoUrl: true },
  });

  const links = [
    { href: "/", label: "Painel" },
    { href: "/manutencoes", label: "Manutenções" },
    { href: "/prestadores", label: "Prestadores" },
    { href: "/relatorios", label: "Relatórios" },
  ];

  if (session.user.role === "ADMIN") {
    links.push({ href: "/configuracoes", label: "Configurações" });
    links.push({ href: "/usuarios", label: "Usuários" });
  }

  return (
    <nav className="print:hidden flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex items-center gap-6">
        {imobiliaria?.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imobiliaria.logoUrl}
            alt={imobiliaria.nome}
            className="h-7 w-auto"
          />
        )}
        <span className="font-semibold text-slate-900">Manutenções</span>
        <NavLinks links={links} />
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <form action={sair} className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{session.user.name}</span>
          <button
            type="submit"
            className="text-sm text-slate-600 underline hover:text-slate-900"
          >
            Sair
          </button>
        </form>
      </div>
    </nav>
  );
}
