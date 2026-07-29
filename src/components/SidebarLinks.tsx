"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarLinks({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-0.5">
      {links.map((link) => {
        const ativo =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded px-3 py-1.5 text-sm ${
              ativo
                ? "bg-slate-900 font-medium text-white dark:bg-slate-700 dark:text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
