import { formatData } from "@/lib/datahora";

type Endereco = {
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  cidade: string | null;
  estado: string | null;
};

function enderecoDoImovel(e: Endereco): string {
  const partes = [
    e.rua,
    e.numero ? `nº ${e.numero}` : null,
    e.complemento,
    e.bairro ? `bairro ${e.bairro}` : null,
    e.cep ? `CEP ${e.cep}` : null,
  ].filter(Boolean);
  return partes.join(", ");
}

export default function OrdemServicoVistoriaDocumento({
  numeroProcesso,
  endereco,
  dataEntregaLaudo,
}: {
  numeroProcesso: string;
  endereco: Endereco;
  dataEntregaLaudo: Date;
}) {
  const cidade = endereco.cidade ?? "Taquaritinga";
  const estado = endereco.estado ?? "SP";
  const emissao = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <div className="font-[Calibri,Carlito,sans-serif] text-[11pt] leading-snug text-black">
      <div className="mb-8 flex items-start justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/os-vistoria-logo.png" alt="Vale do Minho" className="h-11 w-auto" />
        <p className="text-[9pt]">Processo: {numeroProcesso}</p>
      </div>

      <h1 className="text-center text-[14pt]">Ordem de Serviço</h1>
      <h2 className="mb-6 text-center text-[14pt]">LAUDO DE VISTORIA DE SAÍDA EM IMÓVEL LOCADO</h2>

      <p className="mb-5 text-justify font-bold">
        A, VALE DO MINHO LTDA, CNPJ nº 74.559.048/0001-70, CRECI n° 28445-J, com sede nesta
        cidade de Taquaritinga, estado de São Paulo, na Praça Dr. Waldemar D’Ambrósio, nº 147,
        sala 02, bairro Centro, CEP 15.900-024, vem por meio deste documento solicitar ao
        engenheiro civil, VINÍCIUS JOHANNSEN DE PAULA, brasileiro, solteiro, registrado no CREA
        sob nº 5070333392, portador do RG 41.122.692-7 e CPF 370.482.068-70, com endereço
        comercial situado nesta cidade de Taquaritinga, estado de São Paulo, na Praça Dr.
        Waldemar D’Ambrósio, 153, sala 4, bairro Centro, CEP 15900-024, a realização de:
      </p>

      <p className="mb-5 text-justify font-bold">
        SERVIÇO: Laudo de Vistoria de Saída em Imóvel Locado
      </p>

      <p className="mb-10 text-justify font-bold">
        IMÓVEL: {enderecoDoImovel(endereco)}, {cidade}/{estado}
        <br />
        DATA DE ENTREGA DO LAUDO: {formatData(dataEntregaLaudo)}.
      </p>

      <p className="mb-14 text-center">
        Taquaritinga, {emissao}
      </p>

      <div className="flex flex-col gap-10 text-[11pt]">
        <div>
          <p>_______________________________________</p>
          <p className="font-bold">André Henrique da Silva Borges</p>
          <p className="font-bold">Imobiliária Vale do Minho – Monte Real</p>
        </div>
        <div>
          <p>_______________________________________</p>
          <p className="font-bold">Vinicius Johannsen de Paula</p>
          <p className="font-bold">Engenheiro Civil</p>
        </div>
      </div>
    </div>
  );
}
