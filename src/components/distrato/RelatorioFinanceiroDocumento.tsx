import { formatMoedaExibicao } from "@/lib/masks";
import { formatData, formatMesCompetencia } from "@/lib/datahora";

type Lancamento = {
  id: string;
  mesCompetencia: string;
  periodoDias: number | null;
  nomeServico: string | null;
  valor: number;
};

type AdequacaoDetalhe = {
  id: string;
  numeroProcesso: string;
  tipoServico: string;
  valor: number;
};

const SECAO_CLASSE = "mb-6 rounded border border-slate-200 p-4";
const TITULO_CLASSE = "mb-3 border-b border-slate-200 pb-2 text-sm font-semibold";

export default function RelatorioFinanceiroDocumento({
  numeroProcesso,
  valorAluguel,
  prazoContratoMeses,
  prazoMultaMeses,
  prazoContratoInicio,
  dataAvisoPrevio,
  dataEntregaChaves,
  sinalEntregaChaves,
  tituloMulta,
  valorMulta,
  detalheMulta,
  categoriasLancamento,
  adequacoes,
}: {
  numeroProcesso: string;
  valorAluguel: number | null;
  prazoContratoMeses: number | null;
  prazoMultaMeses: number | null;
  prazoContratoInicio: Date | null;
  dataAvisoPrevio: Date | null;
  dataEntregaChaves: Date | null;
  sinalEntregaChaves: string | null;
  tituloMulta: string | null;
  valorMulta: number | null;
  detalheMulta: string | null;
  categoriasLancamento: { titulo: string; itens: Lancamento[] }[];
  adequacoes: AdequacaoDetalhe[];
}) {
  const totalLancamentos = categoriasLancamento.reduce(
    (soma, cat) => soma + cat.itens.reduce((s, l) => s + l.valor, 0),
    0
  );
  const totalAdequacoes = adequacoes.reduce((soma, a) => soma + a.valor, 0);
  const totalGeralAberto = totalLancamentos + totalAdequacoes + (valorMulta ?? 0);

  return (
    <div className="text-black">
      <div className="mb-6 border-b border-slate-300 pb-4 text-center">
        <h1 className="text-lg font-semibold">Relatório Financeiro</h1>
        <p className="text-xs text-slate-600">Processo {numeroProcesso}</p>
      </div>

      <div className={SECAO_CLASSE}>
        <h2 className={TITULO_CLASSE}>Datas e Prazos</h2>
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
              <td className="py-1 pr-4 text-slate-500">Prazo da multa</td>
              <td className="py-1">{prazoMultaMeses ? `${prazoMultaMeses} meses` : "—"}</td>
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
          </tbody>
        </table>
      </div>

      {tituloMulta && valorMulta !== null && (
        <div className={SECAO_CLASSE}>
          <h2 className={TITULO_CLASSE}>{tituloMulta}</h2>
          <p className="text-sm">R$ {formatMoedaExibicao(valorMulta)}</p>
          {detalheMulta && <p className="mt-1 text-xs text-slate-500">{detalheMulta}</p>}
        </div>
      )}

      <div className={SECAO_CLASSE}>
        <h2 className={TITULO_CLASSE}>Valores em Aberto</h2>

        {categoriasLancamento.map((categoria) => {
          if (categoria.itens.length === 0) return null;
          const totalCategoria = categoria.itens.reduce((s, l) => s + l.valor, 0);

          return (
            <div key={categoria.titulo} className="mb-4">
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

        {adequacoes.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Adequações
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-1 font-normal">Processo</th>
                  <th className="pb-1 font-normal">Tipo de Serviço</th>
                  <th className="pb-1 text-right font-normal">Valor</th>
                </tr>
              </thead>
              <tbody>
                {adequacoes.map((a) => (
                  <tr key={a.id}>
                    <td className="py-0.5 pr-4">{a.numeroProcesso}</td>
                    <td className="py-0.5 pr-4">{a.tipoServico}</td>
                    <td className="py-0.5 text-right">R$ {formatMoedaExibicao(a.valor)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-0.5 pr-4 font-semibold" colSpan={2}>
                    Subtotal Adequações
                  </td>
                  <td className="py-0.5 text-right font-semibold">
                    R$ {formatMoedaExibicao(totalAdequacoes)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={SECAO_CLASSE}>
        <p className="text-sm font-semibold">
          Total geral em aberto: R$ {formatMoedaExibicao(totalGeralAberto)}
        </p>
        {valorMulta !== null && (
          <p className="text-xs text-slate-500">
            Inclui a multa ({tituloMulta}: R$ {formatMoedaExibicao(valorMulta)}).
          </p>
        )}
      </div>
    </div>
  );
}
