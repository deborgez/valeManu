"use client";

import { formatNumeroProcesso, PREFIXO_NUMERO_PROCESSO } from "@/lib/masks";
import { InputHTMLAttributes } from "react";

export default function NumeroProcessoInput({
  className,
  defaultValue,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">) {
  return (
    <input
      {...props}
      type="text"
      placeholder="IMB.LC.1.00.00.00000"
      defaultValue={formatNumeroProcesso(
        typeof defaultValue === "string" ? defaultValue : PREFIXO_NUMERO_PROCESSO
      )}
      onChange={(e) => {
        e.target.value = formatNumeroProcesso(e.target.value);
      }}
      className={className}
    />
  );
}
