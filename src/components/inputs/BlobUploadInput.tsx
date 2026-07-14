"use client";

import { upload } from "@vercel/blob/client";
import { useState, type ChangeEvent } from "react";
import { FILE_INPUT_CLASSE } from "@/lib/ui";

type ArquivoEnviado = { url: string; nome: string; tipo: string };

export default function BlobUploadInput({
  name,
  multiple = false,
  accept,
  required = false,
}: {
  name: string;
  multiple?: boolean;
  accept?: string;
  required?: boolean;
}) {
  const [arquivos, setArquivos] = useState<ArquivoEnviado[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setEnviando(true);
    setErro(null);

    try {
      const enviados: ArquivoEnviado[] = [];
      for (const file of Array.from(files)) {
        const resultado = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
        });
        enviados.push({
          url: resultado.url,
          nome: file.name,
          tipo: file.type || "application/octet-stream",
        });
      }
      setArquivos((atual) => (multiple ? [...atual, ...enviados] : enviados));
    } catch {
      setErro("Falha ao enviar arquivo. Tente novamente.");
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        disabled={enviando}
        required={required && arquivos.length === 0}
        className={FILE_INPUT_CLASSE}
      />
      {enviando && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enviando...
        </p>
      )}
      {erro && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{erro}</p>
      )}
      {arquivos.length > 0 && (
        <ul className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {arquivos.map((a, i) => (
            <li key={i}>{a.nome}</li>
          ))}
        </ul>
      )}
      {arquivos.map((a, i) => (
        <input key={`url-${i}`} type="hidden" name={`${name}Url`} value={a.url} />
      ))}
      {arquivos.map((a, i) => (
        <input key={`nome-${i}`} type="hidden" name={`${name}Nome`} value={a.nome} />
      ))}
      {arquivos.map((a, i) => (
        <input key={`tipo-${i}`} type="hidden" name={`${name}Tipo`} value={a.tipo} />
      ))}
    </div>
  );
}
