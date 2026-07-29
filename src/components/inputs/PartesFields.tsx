"use client";

import { useState } from "react";
import TelefoneInput from "./TelefoneInput";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

const LABEL_PARTE: Record<string, string> = {
  LOCADOR: "Locador",
  LOCATARIO: "Locatário",
};

function ParteBloco({
  titulo,
  tipo,
  onTipoChange,
  tipoIndisponivel,
}: {
  titulo: string;
  tipo: string;
  onTipoChange: (tipo: string) => void;
  tipoIndisponivel?: string;
}) {
  const nomeCampo = tipo === "LOCADOR" ? "locadorNome" : "locatarioNome";
  const telefoneCampo = tipo === "LOCADOR" ? "locadorTelefone" : "locatarioTelefone";

  return (
    <div className="mb-4 rounded border border-slate-200 dark:border-slate-700 p-4">
      <p className="mb-2 text-sm font-medium text-slate-800 dark:text-slate-200">{titulo}</p>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Qual parte é essa?
      </label>
      <select
        required
        value={tipo}
        onChange={(e) => onTipoChange(e.target.value)}
        className={`${CAMPO_CLASSE} mb-4`}
      >
        <option value="" disabled>
          Selecione a parte
        </option>
        {(["LOCADOR", "LOCATARIO"] as const).map((opcao) => (
          <option key={opcao} value={opcao} disabled={opcao === tipoIndisponivel}>
            {LABEL_PARTE[opcao]}
          </option>
        ))}
      </select>

      {tipo && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome completo
            </label>
            <input key={nomeCampo} name={nomeCampo} required className={CAMPO_CLASSE} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Telefone
            </label>
            <TelefoneInput key={telefoneCampo} name={telefoneCampo} required className={CAMPO_CLASSE} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function PartesFields() {
  const [tipoParte1, setTipoParte1] = useState("");
  const [tipoParte2, setTipoParte2] = useState("");

  return (
    <div className="mb-4">
      <ParteBloco
        titulo="Parte 1"
        tipo={tipoParte1}
        onTipoChange={setTipoParte1}
        tipoIndisponivel={tipoParte2}
      />
      <ParteBloco
        titulo="Parte 2"
        tipo={tipoParte2}
        onTipoChange={setTipoParte2}
        tipoIndisponivel={tipoParte1}
      />
    </div>
  );
}
