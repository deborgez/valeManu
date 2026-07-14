"use client";

import { formatTelefone } from "@/lib/masks";
import { InputHTMLAttributes } from "react";

export default function TelefoneInput({
  className,
  defaultValue,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">) {
  return (
    <input
      {...props}
      type="tel"
      inputMode="numeric"
      placeholder="(00) 00000-0000"
      defaultValue={
        typeof defaultValue === "string" ? formatTelefone(defaultValue) : ""
      }
      onChange={(e) => {
        e.target.value = formatTelefone(e.target.value);
      }}
      className={className}
    />
  );
}
