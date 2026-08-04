"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LocalEntregaChavesForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        if (enviando) return;
        setEnviando(true);
        await action(formData);
        router.refresh();
        setEnviando(false);
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Onde a entrega das chaves ocorrerá?
        </label>
        <select
          name="local"
          required
          defaultValue=""
          className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="" disabled>
            Selecione
          </option>
          <option value="IMOBILIARIA">Na imobiliária</option>
          <option value="IMOVEL">No imóvel</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={enviando}
        className="w-fit rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-60"
      >
        Confirmar
      </button>
    </form>
  );
}
