import { formatData } from "@/lib/datahora";

type Imobiliaria = {
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  logoUrl: string | null;
} | null;

type Parte = { nome: string; cpf: string };

export default function ReciboEntregaChavesDocumento({
  imobiliaria,
  numeroProcesso,
  endereco,
  locatarios,
  locadores,
  dataEntrega,
  horaEntrega,
}: {
  imobiliaria: Imobiliaria;
  numeroProcesso: string;
  endereco: string;
  locatarios: Parte[];
  locadores: Parte[];
  dataEntrega: Date;
  horaEntrega: string | null;
}) {
  const nomes = (partes: Parte[]) =>
    partes.length > 0 ? partes.map((p) => p.nome).join(", ") : "—";

  return (
    <div className="text-black">
      <div className="mb-6 border-b border-slate-300 pb-4 text-center">
        {imobiliaria?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imobiliaria.logoUrl} alt={imobiliaria.nome} className="mx-auto mb-2 h-14" />
        ) : (
          <h1 className="text-lg font-semibold">{imobiliaria?.nome}</h1>
        )}
        <p className="text-xs text-slate-600">
          {imobiliaria?.endereco} · {imobiliaria?.telefone} · {imobiliaria?.email}
        </p>
      </div>

      <h2 className="mb-6 text-center text-base font-semibold">
        Recibo de Entrega de Chaves — Processo {numeroProcesso}
      </h2>

      <div className="mb-6 grid grid-cols-1 gap-2 text-sm">
        <p>
          <span className="text-slate-500">Imóvel: </span>
          {endereco}
        </p>
        <p>
          <span className="text-slate-500">Locatário(s): </span>
          {nomes(locatarios)}
        </p>
        <p>
          <span className="text-slate-500">Locador(es): </span>
          {nomes(locadores)}
        </p>
        <p>
          <span className="text-slate-500">Data da entrega: </span>
          {formatData(dataEntrega)}
          {horaEntrega ? ` às ${horaEntrega}` : ""}
        </p>
      </div>

      <p className="mb-16 text-justify text-sm">
        A {imobiliaria?.nome ?? "imobiliária"} declara ter recebido, nesta data, as chaves do imóvel
        acima identificado, referentes ao processo {numeroProcesso}, ficando o locatário
        desobrigado da guarda das mesmas a partir desta entrega, sem prejuízo da apuração de
        eventuais pendências constatadas na vistoria de saída.
      </p>

      <div className="flex flex-col gap-12">
        <div className="flex flex-col items-center">
          <div className="w-72 border-t border-slate-500" />
          <p className="mt-1 text-sm font-medium">{imobiliaria?.nome}</p>
          <p className="text-xs text-slate-500">Responsável pelo recebimento</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-72 border-t border-slate-500" />
          <p className="mt-1 text-sm font-medium">
            {locatarios[0]?.nome ?? "Locatário"}
          </p>
          <p className="text-xs text-slate-500">Locatário</p>
        </div>
      </div>
    </div>
  );
}
