"use client";

import { formatCPF } from "@/lib/masks";
import { InputHTMLAttributes } from "react";

export default function CpfInput({
  className,
  defaultValue,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">) {
  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder="000.000.000-00"
      defaultValue={
        typeof defaultValue === "string" ? formatCPF(defaultValue) : ""
      }
      onChange={(e) => {
        e.target.value = formatCPF(e.target.value);
      }}
      className={className}
    />
  );
}
