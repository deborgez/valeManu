import { formatMoedaExibicao } from "@/lib/masks";
import { formatData } from "@/lib/datahora";

type Imobiliaria = {
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  logoUrl: string | null;
} | null;

export default function ReciboPagamentoDocumento({
  imobiliaria,
  numeroProcesso,
  prestador,
  valor,
  dataPagamento,
}: {
  imobiliaria: Imobiliaria;
  numeroProcesso: string;
  prestador: {
    nome: string;
    especialidade: string;
    telefone: string;
    cpf: string | null;
  };
  valor: number | null;
  dataPagamento: Date | null;
}) {
  return (
    <div className="text-black">
      <div className="mb-6 border-b border-slate-300 pb-4 text-center">
        {imobiliaria?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imobiliaria.logoUrl}
            alt={imobiliaria.nome}
            className="mx-auto mb-2 h-14"
          />
        ) : (
          <h1 className="text-lg font-semibold">{imobiliaria?.nome}</h1>
        )}
        <p className="text-xs text-slate-600">
          {imobiliaria?.endereco} · {imobiliaria?.telefone} · {imobiliaria?.email}
        </p>
      </div>

      <h2 className="mb-4 text-center text-base font-semibold">
        Recibo de Pagamento — Processo {numeroProcesso}
      </h2>

      <div className="mb-6 grid grid-cols-2 gap-1 text-sm">
        <p>
          <span className="text-slate-500">Prestador: </span>
          {prestador.nome}
        </p>
        <p>
          <span className="text-slate-500">Especialidade: </span>
          {prestador.especialidade}
        </p>
        <p>
          <span className="text-slate-500">Telefone: </span>
          {prestador.telefone}
        </p>
        {prestador.cpf && (
          <p>
            <span className="text-slate-500">CPF/CNPJ: </span>
            {prestador.cpf}
          </p>
        )}
      </div>

      <p className="mb-16 text-sm">
        Recebi de {imobiliaria?.nome} a quantia de{" "}
        <strong>R$ {formatMoedaExibicao(valor)}</strong> referente à execução
        do serviço do processo {numeroProcesso}, dando plena e geral quitação
        pelo valor recebido.
      </p>

      <div className="flex flex-col items-center">
        <div className="w-64 border-t border-slate-500" />
        <p className="mt-1 text-sm font-medium">{prestador.nome}</p>
        <p className="mt-1 text-xs text-slate-500">
          Data:{" "}
          {formatData(dataPagamento ?? new Date())}
        </p>
      </div>
    </div>
  );
}
