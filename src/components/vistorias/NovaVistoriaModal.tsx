"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BlobUploadInput from "@/components/inputs/BlobUploadInput";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export type ProcessoOpcao = {
  id: string;
  numeroProcesso: string;
  endereco: string;
  valor: string | null;
};

export default function NovaVistoriaModal({
  tipoLabel,
  processos,
  action,
}: {
  tipoLabel: string;
  processos: ProcessoOpcao[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<ProcessoOpcao | null>(null);
  const router = useRouter();

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return [];
    return processos
      .filter((p) => `${p.numeroProcesso} ${p.endereco}`.toLowerCase().includes(termo))
      .slice(0, 20);
  }, [busca, processos]);

  function abrir() {
    setBusca("");
    setSelecionado(null);
    setErro(null);
    setAberto(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
      >
        Adicionar Nova Vistoria
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <form
            action={async (formData) => {
              if (enviando) return;
              setEnviando(true);
              setErro(null);
              try {
                await action(formData);
                router.refresh();
                setAberto(false);
              } catch {
                setErro(
                  "Não foi possível solicitar a vistoria. Confira os dados e tente novamente."
                );
              } finally {
                setEnviando(false);
              }
            }}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg"
          >
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Nova Vistoria de {tipoLabel}
            </h3>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Processo
              </label>
              {selecionado ? (
                <div className="flex items-start justify-between gap-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {selecionado.numeroProcesso}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">{selecionado.endereco}</p>
                    {selecionado.valor && (
                      <p className="text-slate-500 dark:text-slate-400">R$ {selecionado.valor}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelecionado(null)}
                    className="text-xs text-slate-500 underline"
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <>
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por número ou endereço"
                    className={CAMPO_CLASSE}
                    autoFocus
                  />
                  {busca.trim() !== "" && (
                    <ul className="mt-2 max-h-48 overflow-y-auto rounded border border-slate-200 dark:border-slate-700">
                      {filtrados.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => setSelecionado(p)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {p.numeroProcesso}
                            </span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400">
                              {p.endereco}
                            </span>
                          </button>
                        </li>
                      ))}
                      {filtrados.length === 0 && (
                        <li className="px-3 py-2 text-sm text-slate-400">
                          Nenhum processo encontrado.
                        </li>
                      )}
                    </ul>
                  )}
                </>
              )}
              <input type="hidden" name="processoId" value={selecionado?.id ?? ""} />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Comprovante do pagamento do sinal
              </label>
              <BlobUploadInput name="comprovante" accept="image/*,application/pdf" required />
            </div>

            {erro && <p className="mb-3 text-xs text-red-600 dark:text-red-400">{erro}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando || !selecionado}
                className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-60"
              >
                Solicitar Vistoria de {tipoLabel}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
