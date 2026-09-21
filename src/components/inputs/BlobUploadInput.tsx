"use client";

import { useState, type ChangeEvent } from "react";
import { FILE_INPUT_CLASSE } from "@/lib/ui";
import { comprimirImagem } from "@/lib/comprimirImagem";

type ArquivoEnviado = { url: string; nome: string; tipo: string };

export default function BlobUploadInput({
  name,
  multiple = false,
  accept,
  required = false,
  defaultValue,
}: {
  name: string;
  multiple?: boolean;
  accept?: string;
  required?: boolean;
  defaultValue?: ArquivoEnviado | null;
}) {
  const [arquivos, setArquivos] = useState<ArquivoEnviado[]>(
    defaultValue ? [defaultValue] : []
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setEnviando(true);
    setErro(null);

    try {
      const enviados: ArquivoEnviado[] = [];
      for (const arquivoOriginal of Array.from(files)) {
        const file = await comprimirImagem(arquivoOriginal);
        const contentType = file.type || "application/octet-stream";

        const respostaAssinatura = await fetch("/api/blob/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType,
            size: file.size,
          }),
        });
        if (!respostaAssinatura.ok) {
          throw new Error("Falha ao preparar o envio do arquivo.");
        }
        const { uploadUrl, publicUrl } = await respostaAssinatura.json();

        const respostaUpload = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": contentType },
          body: file,
        });
        if (!respostaUpload.ok) {
          throw new Error("Falha ao enviar o arquivo.");
        }

        enviados.push({
          url: publicUrl,
          nome: file.name,
          tipo: contentType,
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
    <div className="relative">
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        disabled={enviando}
        required={required && arquivos.length === 0}
        className={FILE_INPUT_CLASSE}
      />
      {(enviando || erro || arquivos.length > 0) && (
        <div className="absolute top-full left-0 z-10 mt-1 whitespace-nowrap">
          {enviando && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enviando...
            </p>
          )}
          {erro && (
            <p className="text-xs text-red-600 dark:text-red-400">{erro}</p>
          )}
          {arquivos.length > 0 && (
            <ul className="text-xs text-slate-500 dark:text-slate-400">
              {arquivos.map((a, i) => (
                <li key={i}>{a.nome}</li>
              ))}
            </ul>
          )}
        </div>
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
