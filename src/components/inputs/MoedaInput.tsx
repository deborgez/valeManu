"use client";

import { formatMoedaDigits, formatMoedaExibicao } from "@/lib/masks";
import { InputHTMLAttributes } from "react";

export default function MoedaInput({
  className,
  defaultValue,
  onValueChange,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  defaultValue?: number | null;
  /** Chamado após a formatação, com o valor exibido (ex.: "1.234,56"). Útil para cálculos ao vivo. */
  onValueChange?: (valorFormatado: string) => void;
}) {
  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      placeholder="0,00"
      defaultValue={
        defaultValue ? formatMoedaExibicao(defaultValue) : ""
      }
      onChange={(e) => {
        e.target.value = formatMoedaDigits(e.target.value);
        onValueChange?.(e.target.value);
      }}
      className={className}
    />
  );
}
