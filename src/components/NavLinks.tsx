"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const ativo =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`border-b-2 pb-0.5 text-sm ${
              ativo
                ? "border-slate-900 font-medium text-slate-900 dark:border-slate-100 dark:text-slate-100"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
