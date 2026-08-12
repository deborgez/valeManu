import { formatMoedaExibicao } from "@/lib/masks";
import { formatData, formatMesCompetencia } from "@/lib/datahora";

type Lancamento = {
  id: string;
  mesCompetencia: string;
  periodoDias: number | null;
  nomeServico: string | null;
  valor: number;
};

export default function RelatorioFinanceiroDocumento({
  numeroProcesso,
  valorAluguel,
  prazoContratoMeses,
  prazoContratoInicio,
  dataAvisoPrevio,
  dataEntregaChaves,
  sinalEntregaChaves,
  prazoMultaMeses,
  tituloMulta,
  valorMulta,
  detalheMulta,
  categoriasLancamento,
  totalAdequacoesLocatario,
}: {
  numeroProcesso: string;
  valorAluguel: number | null;
  prazoContratoMeses: number | null;
  prazoContratoInicio: Date | null;
  dataAvisoPrevio: Date | null;
  dataEntregaChaves: Date | null;
  sinalEntregaChaves: string | null;
  prazoMultaMeses: number | null;
  tituloMulta: string | null;
  valorMulta: number | null;
  detalheMulta: string | null;
  categoriasLancamento: { titulo: string; itens: Lancamento[] }[];
  totalAdequacoesLocatario: number;
}) {
  const totalLancamentos = categoriasLancamento.reduce(
    (soma, cat) => soma + cat.itens.reduce((s, l) => s + l.valor, 0),
    0
  );
  const totalGeralAberto = totalLancamentos + totalAdequacoesLocatario;

  return (
    <div className="text-black">
      <div className="mb-6 border-b border-slate-300 pb-4 text-center">
        <h1 className="text-lg font-semibold">Relatório Financeiro</h1>
        <p className="text-xs text-slate-600">Processo {numeroProcesso}</p>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-sm font-semibold">Datas e Prazos</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="py-1 pr-4 text-slate-500">Valor do aluguel</td>
              <td className="py-1">
                {valorAluguel !== null ? `R$ ${formatMoedaExibicao(valorAluguel)}` : "—"}
              </td>
            </tr>
            <tr>
              <td className="py-1 pr-4 text-slate-500">Prazo do contrato</td>
              <td className="py-1">
                {prazoContratoMeses ? `${prazoContratoMeses} meses` : "—"}
              </td>
            </tr>
            <tr>
              <td className="py-1 pr-4 text-slate-500">Data de início</td>
              <td className="py-1">
                {prazoContratoInicio ? formatData(prazoContratoInicio) : "—"}
              </td>
            </tr>
            <tr>
              <td className="py-1 pr-4 text-slate-500">Data do aviso prévio</td>
              <td className="py-1">{dataAvisoPrevio ? formatData(dataAvisoPrevio) : "—"}</td>
            </tr>
            <tr>
              <td className="py-1 pr-4 text-slate-500">Data de entrega das chaves</td>
              <td className="py-1">
                {dataEntregaChaves ? formatData(dataEntregaChaves) : "—"}
                {sinalEntregaChaves ? ` — ${sinalEntregaChaves}` : ""}
              </td>
            </tr>
            <tr>
              <td className="py-1 pr-4 text-slate-500">Prazo da multa</td>
              <td className="py-1">{prazoMultaMeses ? `${prazoMultaMeses} meses` : "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {tituloMulta && valorMulta !== null && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-semibold">{tituloMulta}</h2>
          <p className="text-sm">R$ {formatMoedaExibicao(valorMulta)}</p>
          {detalheMulta && <p className="text-xs text-slate-500">{detalheMulta}</p>}
        </div>
      )}

      <div className="mb-6">
        <h2 className="mb-2 text-sm font-semibold">Valores em Aberto</h2>

        {categoriasLancamento.map((categoria) => {
          if (categoria.itens.length === 0) return null;
          const totalCategoria = categoria.itens.reduce((s, l) => s + l.valor, 0);

          return (
            <div key={categoria.titulo} className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {categoria.titulo}
              </p>
              <table className="w-full text-sm">
                <tbody>
                  {categoria.itens.map((l) => (
                    <tr key={l.id}>
                      <td className="py-0.5 pr-4">
                        {l.nomeServico ? `${l.nomeServico} — ` : ""}
                        {formatMesCompetencia(l.mesCompetencia)}
                        {l.periodoDias ? ` (${l.periodoDias} dias)` : ""}
                      </td>
                      <td className="py-0.5 text-right">
                        R$ {formatMoedaExibicao(l.valor)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-0.5 pr-4 font-semibold">Subtotal {categoria.titulo}</td>
                    <td className="py-0.5 text-right font-semibold">
                      R$ {formatMoedaExibicao(totalCategoria)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}

        {totalAdequacoesLocatario > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Adequações
            </p>
            <p className="text-sm">R$ {formatMoedaExibicao(totalAdequacoesLocatario)}</p>
          </div>
        )}

        <div className="mt-4 border-t border-slate-300 pt-2">
          <p className="text-sm font-semibold">
            Total geral em aberto: R$ {formatMoedaExibicao(totalGeralAberto)}
          </p>
        </div>
      </div>
    </div>
  );
}
