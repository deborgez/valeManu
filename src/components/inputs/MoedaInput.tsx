"use client";

import { formatMoedaDigits, formatMoedaExibicao } from "@/lib/masks";
import { InputHTMLAttributes } from "react";

export default function MoedaInput({
  className,
  defaultValue,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  defaultValue?: number | null;
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
      }}
      className={className}
    />
  );
}
