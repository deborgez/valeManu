import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { enviarOrcamentoProfissional } from "./actions";
import MoedaInput from "@/components/inputs/MoedaInput";
import BlobUploadInput from "@/components/inputs/BlobUploadInput";
import { formatEndereco } from "@/lib/endereco";
import { LABEL_PEDIDO_STATUS } from "@/lib/labels";

const LABEL_PARTE: Record<string, string> = {
  LOCADOR: "Locador",
  LOCATARIO: "Locatário",
};

export default async function OrcamentoPublicoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const pedido = await prisma.pedidoOrcamento.findUnique({
    where: { token },
    include: {
      manutencao: true,
      prestador: true,
      geradoPor: true,
      anexos: true,
    },
  });

  if (!pedido) notFound();

  const imobiliaria = await prisma.imobiliaria.findUnique({
    where: { id: "singleton" },
  });

  const fotosVideos = pedido.anexos.filter((a) => a.tipo !== "ORCAMENTO");
  const podeEnviar = pedido.status === "AGUARDANDO_ENTREGA";

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center">
        {imobiliaria?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imobiliaria.logoUrl}
            alt={imobiliaria.nome}
            className="mx-auto mb-3 h-14"
          />
        ) : (
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {imobiliaria?.nome}
          </h1>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {imobiliaria?.endereco} · {imobiliaria?.telefone} · {imobiliaria?.email}
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
          Pedido de Orçamento — Processo {pedido.manutencao.numeroProcesso}
        </h2>

        <div className="mb-4 grid grid-cols-1 gap-1 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
          <p>
            <span className="text-slate-400 dark:text-slate-500">Profissional: </span>
            {pedido.prestador.nome}
          </p>
          <p>
            <span className="text-slate-400 dark:text-slate-500">Especialidade: </span>
            {pedido.prestador.especialidade}
          </p>
          <p>
            <span className="text-slate-400 dark:text-slate-500">Endereço do imóvel: </span>
            {formatEndereco(pedido.manutencao)}
          </p>
          <p>
            <span className="text-slate-400 dark:text-slate-500">Natureza: </span>
            {pedido.manutencao.natureza}
          </p>
          <p>
            <span className="text-slate-400 dark:text-slate-500">Competência: </span>
            {LABEL_PARTE[pedido.manutencao.competencia]}
          </p>
          {pedido.manutencao.emergencial && (
            <p className="font-medium text-red-600 dark:text-red-400">Serviço emergencial</p>
          )}
        </div>

        <div className="mb-4">
          <p className="mb-1 text-sm text-slate-400 dark:text-slate-500">Descrição do problema</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {pedido.manutencao.descricaoProblema}
          </p>
        </div>

        {fotosVideos.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm text-slate-400 dark:text-slate-500">Fotos / Vídeos</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {fotosVideos.map((anexo) =>
                anexo.tipo === "VIDEO" ? (
                  <video
                    key={anexo.id}
                    src={anexo.path}
                    controls
                    className="rounded border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={anexo.id}
                    src={anexo.path}
                    alt={anexo.filename}
                    className="rounded border border-slate-200 dark:border-slate-700"
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>

      {podeEnviar ? (
        <form
          action={async (formData: FormData) => {
            "use server";
            await enviarOrcamentoProfissional(token, formData);
          }}
          className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
        >
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            Enviar Orçamento
          </h2>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mão de obra (R$)
              </label>
              <MoedaInput
                name="valorMaoDeObra"
                required
                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Material (R$)
              </label>
              <MoedaInput
                name="valorMaterial"
                required
                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Descrição do que será feito
            </label>
            <textarea
              name="descricaoServico"
              required
              rows={3}
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Anexar orçamento (PDF ou imagem)
            </label>
            <BlobUploadInput
              name="arquivoOrcamento"
              accept="image/*,application/pdf"
            />
          </div>

          <button
            type="submit"
            className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
          >
            Enviar Orçamento
          </button>
        </form>
      ) : (
        <div className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Este orçamento já foi enviado. Status atual:{" "}
          {LABEL_PEDIDO_STATUS[pedido.status] ?? pedido.status}
        </div>
      )}

      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        Esse pedido foi gerado por {pedido.geradoPor.nome}
      </p>
    </div>
  );
}
