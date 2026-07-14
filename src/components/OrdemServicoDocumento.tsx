import { formatMoedaExibicao } from "@/lib/masks";
import { formatEndereco } from "@/lib/endereco";

const LABEL_PARTE: Record<string, string> = {
  LOCADOR: "Locador",
  LOCATARIO: "Locatário",
};

type Imobiliaria = {
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  logoUrl: string | null;
} | null;

type Endereco = {
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
};

export default function OrdemServicoDocumento({
  imobiliaria,
  numeroProcesso,
  descricaoProblema,
  natureza,
  competencia,
  endereco,
  prestador,
  valorMaoDeObra,
  valorMaterial,
  descricaoServico,
  tipoInicio,
  dataHoraAgendada,
}: {
  imobiliaria: Imobiliaria;
  numeroProcesso: string;
  descricaoProblema: string;
  natureza: string;
  competencia: string;
  endereco: Endereco;
  prestador: {
    nome: string;
    especialidade: string;
    telefone: string;
    cpf: string | null;
  };
  valorMaoDeObra: number | null;
  valorMaterial: number | null;
  descricaoServico: string | null;
  tipoInicio: string;
  dataHoraAgendada: Date | null;
}) {
  const total = (valorMaoDeObra ?? 0) + (valorMaterial ?? 0);

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
        Ordem de Serviço — Processo {numeroProcesso}
      </h2>

      <div className="mb-4 grid grid-cols-2 gap-1 text-sm">
        <p className="col-span-2">
          <span className="text-slate-500">Endereço do imóvel: </span>
          {formatEndereco(endereco)}
        </p>
        <p>
          <span className="text-slate-500">Natureza: </span>
          {natureza}
        </p>
        <p>
          <span className="text-slate-500">Competência: </span>
          {LABEL_PARTE[competencia]}
        </p>
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

      <div className="mb-4">
        <p className="mb-1 text-sm text-slate-500">Descrição do problema</p>
        <p className="text-sm">{descricaoProblema}</p>
      </div>

      {descricaoServico && (
        <div className="mb-4">
          <p className="mb-1 text-sm text-slate-500">
            Descrição do serviço a ser executado
          </p>
          <p className="text-sm">{descricaoServico}</p>
        </div>
      )}

      <div className="mb-4 text-sm">
        <p className="mb-1 text-slate-500">Início do serviço</p>
        {tipoInicio === "IMEDIATO" ? (
          <p>Início imediato</p>
        ) : (
          <p>Agendado para {dataHoraAgendada?.toLocaleString("pt-BR")}</p>
        )}
      </div>

      <table className="mb-6 w-full text-sm">
        <tbody>
          <tr className="border-t border-slate-200">
            <td className="py-2 text-slate-500">Mão de obra</td>
            <td className="py-2 text-right">
              R$ {formatMoedaExibicao(valorMaoDeObra)}
            </td>
          </tr>
          <tr className="border-t border-slate-200">
            <td className="py-2 text-slate-500">Material</td>
            <td className="py-2 text-right">
              R$ {formatMoedaExibicao(valorMaterial)}
            </td>
          </tr>
          <tr className="border-t border-b border-slate-300 font-semibold">
            <td className="py-2">Total</td>
            <td className="py-2 text-right">R$ {formatMoedaExibicao(total)}</td>
          </tr>
        </tbody>
      </table>

      <p className="mb-16 text-sm">
        Declaro estar ciente do serviço acima descrito e me comprometo a
        executá-lo conforme especificado.
      </p>

      <div className="flex flex-col items-center">
        <div className="w-64 border-t border-slate-500" />
        <p className="mt-1 text-sm font-medium">{prestador.nome}</p>
        <p className="mt-1 text-xs text-slate-500">
          Data: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>
    </div>
  );
}
