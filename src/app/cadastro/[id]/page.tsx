import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatEndereco } from "@/lib/endereco";
import { LABEL_TIPO_FIANCA } from "@/lib/labels";
import { formatData } from "@/lib/datahora";

export default async function ProcessoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const processo = await prisma.processo.findUnique({
    where: { id },
    include: { criadoPor: true, partes: true },
  });

  if (!processo) notFound();

  const locadores = processo.partes.filter((p) => p.tipo === "LOCADOR");
  const locatarios = processo.partes.filter((p) => p.tipo === "LOCATARIO");

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Processo {processo.numeroProcesso}
      </h1>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="mb-1 text-slate-400 dark:text-slate-500">Unidade</p>
            <p className="text-slate-700 dark:text-slate-300">{processo.unidade || "—"}</p>
          </div>
          <div>
            <p className="mb-1 text-slate-400 dark:text-slate-500">Captador</p>
            <p className="text-slate-700 dark:text-slate-300">{processo.captador || "—"}</p>
          </div>
          <div>
            <p className="mb-1 text-slate-400 dark:text-slate-500">Início de Contrato</p>
            <p className="text-slate-700 dark:text-slate-300">
              {processo.prazoContratoInicio ? formatData(processo.prazoContratoInicio) : "—"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-slate-400 dark:text-slate-500">Prazo do Contrato</p>
            <p className="text-slate-700 dark:text-slate-300">
              {processo.prazoContratoMeses
                ? `${processo.prazoContratoMeses} ${processo.prazoContratoMeses === 1 ? "mês" : "meses"}${
                    processo.prazoContratoFim
                      ? ` (até ${formatData(processo.prazoContratoFim)})`
                      : ""
                  }`
                : "—"}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-1 text-sm text-slate-400 dark:text-slate-500">Endereço do imóvel</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {processo.codigoImovel && `Código ${processo.codigoImovel} — `}
            {formatEndereco(processo)}
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-sm text-slate-400 dark:text-slate-500">Locador(es)</p>
            {locadores.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum locador cadastrado.</p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {locadores.map((parte) => (
                  <li key={parte.id} className="text-slate-700 dark:text-slate-300">
                    {parte.nome} — {parte.telefone} — RG {parte.rg}, CPF {parte.cpf}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 text-sm text-slate-400 dark:text-slate-500">Locatário(s)</p>
            {locatarios.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum locatário cadastrado.</p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {locatarios.map((parte) => (
                  <li key={parte.id} className="text-slate-700 dark:text-slate-300">
                    {parte.nome} — {parte.telefone} — RG {parte.rg}, CPF {parte.cpf}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mb-4 text-sm">
          <p className="mb-1 text-slate-400 dark:text-slate-500">
            {processo.tipoFianca ? LABEL_TIPO_FIANCA[processo.tipoFianca] : "Fiança"}
          </p>
          {processo.fiancaNome ? (
            <>
              <p className="text-slate-700 dark:text-slate-300">{processo.fiancaNome}</p>
              {processo.fiancaTelefone && (
                <p className="text-slate-500 dark:text-slate-400">{processo.fiancaTelefone}</p>
              )}
              {(processo.fiancaRg || processo.fiancaCpf) && (
                <p className="text-slate-500 dark:text-slate-400">
                  {processo.fiancaRg && `RG ${processo.fiancaRg}`}
                  {processo.fiancaRg && processo.fiancaCpf ? ", " : ""}
                  {processo.fiancaCpf && `CPF ${processo.fiancaCpf}`}
                </p>
              )}
            </>
          ) : (
            <p className="text-slate-400 dark:text-slate-500">Não informada.</p>
          )}
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          Cadastrado por {processo.criadoPor.nome} em{" "}
          {formatData(processo.createdAt)}
        </p>
      </div>
    </div>
  );
}
