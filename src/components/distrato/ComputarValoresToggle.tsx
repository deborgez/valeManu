"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ComputarValoresToggle({
  checked,
  action,
}: {
  checked: boolean;
  action: (computar: boolean) => Promise<void>;
}) {
  const [valor, setValor] = useState(checked);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <label
      className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={valor}
        disabled={pending}
        onChange={(e) => {
          const novo = e.target.checked;
          setValor(novo);
          startTransition(async () => {
            await action(novo);
            router.refresh();
          });
        }}
        className="h-3.5 w-3.5"
      />
      Computar valores
    </label>
  );
}
