"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AvisoTemporario({
  mensagem,
  param,
  duracaoMs = 5000,
}: {
  mensagem: string;
  param: string;
  duracaoMs?: number;
}) {
  const [visivel, setVisivel] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisivel(false);
      const params = new URLSearchParams(searchParams.toString());
      params.delete(param);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, duracaoMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visivel) return null;

  return (
    <p className="mb-4 rounded bg-red-50 dark:bg-red-950 px-3 py-2 text-sm text-red-700 dark:text-red-400">
      {mensagem}
    </p>
  );
}
