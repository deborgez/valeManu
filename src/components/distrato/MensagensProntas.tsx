"use client";

import { useMemo, useState } from "react";

type Contato = { rotulo: string; nome: string; telefone: string };

export default function MensagensProntas({
  contatos,
  numeroProcesso,
  endereco,
  imobiliaria,
  prazoChaves,
}: {
  contatos: Contato[];
  numeroProcesso: string;
  endereco: string;
  imobiliaria: string;
  prazoChaves: string | null;
}) {
  const [indiceModelo, setIndiceModelo] = useState(0);
  const [indiceContato, setIndiceContato] = useState(0);
  const [editado, setEditado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const contato = contatos[indiceContato];
  const nome = contato?.nome ?? "";

  const modelos = useMemo(
    () => [
      {
        titulo: "Recebimento do aviso prévio",
        texto: `Olá, ${nome}! Informamos que recebemos o aviso de encerramento do contrato do imóvel ${endereco} (processo ${numeroProcesso}). Em breve entraremos em contato para alinhar a entrega das chaves e a vistoria de saída. Qualquer dúvida, estamos à disposição. ${imobiliaria}`,
      },
      {
        titulo: "Entrega das chaves",
        texto: `Olá, ${nome}! Sobre o imóvel ${endereco} (processo ${numeroProcesso}): a entrega das chaves deve ser feita na imobiliária${prazoChaves ? ` até ${prazoChaves}` : ""}. Por favor, confirme o melhor dia e horário para você. ${imobiliaria}`,
      },
      {
        titulo: "Vistoria de saída solicitada",
        texto: `Olá, ${nome}! A vistoria de saída do imóvel ${endereco} (processo ${numeroProcesso}) foi solicitada. O laudo será entregue em até 5 dias úteis. Se você deseja acompanhar a vistoria, nos avise para combinarmos o horário. ${imobiliaria}`,
      },
      {
        titulo: "Vistoria concluída",
        texto: `Olá, ${nome}! A vistoria de saída do imóvel ${endereco} (processo ${numeroProcesso}) foi concluída. Os próximos passos e eventuais pendências serão informados em breve. Obrigado pela atenção. ${imobiliaria}`,
      },
    ],
    [nome, endereco, numeroProcesso, imobiliaria, prazoChaves]
  );

  const texto = editado ?? modelos[indiceModelo].texto;
  const digitos = (contato?.telefone ?? "").replace(/\D/g, "");
  const linkWhatsapp = digitos
    ? `https://wa.me/${digitos.startsWith("55") ? digitos : `55${digitos}`}?text=${encodeURIComponent(texto)}`
    : null;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      setCopiado(false);
    }
  }

  if (contatos.length === 0) return null;

  return (
    <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Mensagens prontas
      </h2>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Modelo
          </label>
          <select
            value={indiceModelo}
            onChange={(e) => {
              setIndiceModelo(Number(e.target.value));
              setEditado(null);
            }}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            {modelos.map((m, i) => (
              <option key={m.titulo} value={i}>
                {m.titulo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Destinatário
          </label>
          <select
            value={indiceContato}
            onChange={(e) => {
              setIndiceContato(Number(e.target.value));
              setEditado(null);
            }}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            {contatos.map((c, i) => (
              <option key={`${c.rotulo}-${c.nome}`} value={i}>
                {c.rotulo}: {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>
      <textarea
        value={texto}
        onChange={(e) => setEditado(e.target.value)}
        rows={5}
        className="mb-3 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copiar}
          className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {copiado ? "Copiado!" : "Copiar mensagem"}
        </button>
        {linkWhatsapp ? (
          <a
            href={linkWhatsapp}
            target="_blank"
            rel="noreferrer"
            className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
          >
            Abrir no WhatsApp
          </a>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Sem telefone cadastrado para este contato.
          </span>
        )}
      </div>
    </section>
  );
}
