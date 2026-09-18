import { formatData, formatMesCompetencia } from "@/lib/datahora";
import { formatMoedaExibicao } from "@/lib/masks";
import { LABEL_PARTE_JURIDICA, LABEL_MEIO_NOTIFICACAO } from "@/lib/labels";

type Lancamento = {
  id: string;
  mesCompetencia: string;
  periodoDias: number | null;
  nomeServico: string | null;
  valor: number;
};

type Parcela = {
  numero: number;
  dataVencimento: Date;
  valor: number;
  pago: boolean;
  dataPagamento: Date | null;
};

const SECAO_CLASSE = "mb-6 rounded border border-slate-200 p-4";
const TITULO_CLASSE = "mb-3 border-b border-slate-200 pb-2 text-sm font-semibold";

export default function RelatorioJuridicoDocumento({
  numeroProcesso,
  endereco,
  locadores,
  locatarios,
  eventos,
  categoriasLancamento,
  totalAdequacoes,
  tituloMulta,
  valorMulta,
  totalGeralAberto,
  acordo,
  tratativas,
  notificacoes,
}: {
  numeroProcesso: string;
  endereco: string;
  locadores: { nome: string; telefone: string }[];
  locatarios: { nome: string; telefone: string }[];
  eventos: { titulo: string; data: Date | null }[];
  categoriasLancamento: { titulo: string; itens: Lancamento[]; total: number }[];
  totalAdequacoes: number;
  tituloMulta: string | null;
  valorMulta: number | null;
  totalGeralAberto: number;
  acordo: {
    valorOriginal: number;
    valorFinal: number;
    numeroParcelas: number;
    parcelas: Parcela[];
  } | null;
  tratativas: { parte: string; data: Date; descricao: string }[];
  notificacoes: { parte: string; meio: string; data: Date; descricao: string }[];
}) {
  return (
    <div className="text-black">
      <div className="mb-6 border-b border-slate-300 pb-4 text-center">
        <h1 className="text-lg font-semibold">Relatório Jurídico</h1>
        <p className="text-xs text-slate-600">Processo {numeroProcesso}</p>
      </div>

      <div className={SECAO_CLASSE}>
        <h2 className={TITULO_CLASSE}>Dados do Processo</h2>
        <p className="text-sm">
          <span className="text-slate-500">Endereço: </span>
          {endereco}
        </p>
        <p className="mt-1 text-sm">
          <span className="text-slate-500">Locador(es): </span>
          {locadores.length > 0
            ? locadores.map((l) => `${l.nome} (${l.telefone})`).join("; ")
            : "—"}
        </p>
        <p className="mt-1 text-sm">
          <span className="text-slate-500">Locatário(s): </span>
          {locatarios.length > 0
            ? locatarios.map((l) => `${l.nome} (${l.telefone})`).join("; ")
            : "—"}
        </p>
      </div>

      <div className={SECAO_CLASSE}>
        <h2 className={TITULO_CLASSE}>Linha do Tempo</h2>
        <table className="w-full text-sm">
          <tbody>
            {eventos.map((e) => (
              <tr key={e.titulo}>
                <td className="py-1 pr-4 text-slate-500">{e.titulo}</td>
                <td className="py-1">{e.data ? formatData(e.data) : "Não registrado"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={SECAO_CLASSE}>
        <h2 className={TITULO_CLASSE}>Valores em Aberto</h2>
        {categoriasLancamento.map((cat) => (
          <div key={cat.titulo} className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {cat.titulo}
            </p>
            <table className="w-full text-sm">
              <tbody>
                {cat.itens.map((l) => (
                  <tr key={l.id}>
                    <td className="py-0.5 pr-4">
                      {l.nomeServico ? `${l.nomeServico} — ` : ""}
                      {formatMesCompetencia(l.mesCompetencia)}
                      {l.periodoDias ? ` (${l.periodoDias} dias)` : ""}
                    </td>
                    <td className="py-0.5 text-right">R$ {formatMoedaExibicao(l.valor)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-0.5 pr-4 font-semibold">Subtotal</td>
                  <td className="py-0.5 text-right font-semibold">
                    R$ {formatMoedaExibicao(cat.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
        {totalAdequacoes > 0 && (
          <p className="mb-1 flex justify-between text-sm">
            <span>Adequações (custo repassado ao locatário)</span>
            <span className="font-semibold">R$ {formatMoedaExibicao(totalAdequacoes)}</span>
          </p>
        )}
        {valorMulta !== null && valorMulta > 0 && (
          <p className="mb-1 flex justify-between text-sm">
            <span>{tituloMulta}</span>
            <span className="font-semibold">R$ {formatMoedaExibicao(valorMulta)}</span>
          </p>
        )}
        <p className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold">
          <span>Total geral em aberto</span>
          <span>R$ {formatMoedaExibicao(totalGeralAberto)}</span>
        </p>
      </div>

      <div className={SECAO_CLASSE}>
        <h2 className={TITULO_CLASSE}>Acordo</h2>
        {!acordo ? (
          <p className="text-sm text-slate-500">Nenhum acordo registrado.</p>
        ) : (
          <>
            <p className="text-sm">
              Valor original: R$ {formatMoedaExibicao(acordo.valorOriginal)}
            </p>
            <p className="text-sm font-semibold">
              Valor final: R$ {formatMoedaExibicao(acordo.valorFinal)} em {acordo.numeroParcelas}x
            </p>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-1 font-normal">Parcela</th>
                  <th className="pb-1 font-normal">Vencimento</th>
                  <th className="pb-1 text-right font-normal">Valor</th>
                  <th className="pb-1 text-right font-normal">Situação</th>
                </tr>
              </thead>
              <tbody>
                {acordo.parcelas.map((p) => (
                  <tr key={p.numero}>
                    <td className="py-0.5">
                      {p.numero}/{acordo.numeroParcelas}
                    </td>
                    <td className="py-0.5">{formatData(p.dataVencimento)}</td>
                    <td className="py-0.5 text-right">R$ {formatMoedaExibicao(p.valor)}</td>
                    <td className="py-0.5 text-right">
                      {p.pago
                        ? `Paga em ${p.dataPagamento ? formatData(p.dataPagamento) : "—"}`
                        : "Pendente"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className={SECAO_CLASSE}>
        <h2 className={TITULO_CLASSE}>Tratativas</h2>
        {tratativas.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma tratativa registrada.</p>
        ) : (
          <ul className="text-sm">
            {tratativas.map((t, i) => (
              <li key={i} className="mb-2">
                <span className="font-semibold">
                  {formatData(t.data)} — {LABEL_PARTE_JURIDICA[t.parte]}:
                </span>{" "}
                {t.descricao}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={SECAO_CLASSE}>
        <h2 className={TITULO_CLASSE}>Notificações</h2>
        {notificacoes.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma notificação registrada.</p>
        ) : (
          <ul className="text-sm">
            {notificacoes.map((n, i) => (
              <li key={i} className="mb-2">
                <span className="font-semibold">
                  {formatData(n.data)} — {LABEL_PARTE_JURIDICA[n.parte]} (
                  {LABEL_MEIO_NOTIFICACAO[n.meio]}):
                </span>{" "}
                {n.descricao}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
