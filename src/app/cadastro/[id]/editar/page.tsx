import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProcessoForm, { type ProcessoInicial } from "@/components/inputs/ProcessoForm";
import { editarProcesso } from "../../actions";

export default async function EditarProcessoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const processo = await prisma.processo.findUnique({
    where: { id },
    include: { partes: true },
  });

  if (!processo) notFound();

  const processoInicial: ProcessoInicial = {
    numeroProcesso: processo.numeroProcesso,
    unidade: processo.unidade,
    prazoContratoInicio: processo.prazoContratoInicio
      ? processo.prazoContratoInicio.toISOString().slice(0, 10)
      : null,
    prazoContratoMeses: processo.prazoContratoMeses,
    prazoMultaMeses: processo.prazoMultaMeses,
    endereco: processo.rua
      ? {
          codigoImovel: processo.codigoImovel ?? "",
          cep: processo.cep ?? "",
          rua: processo.rua ?? "",
          numero: processo.numero ?? "",
          complemento: processo.complemento ?? "",
          bairro: processo.bairro ?? "",
          cidade: processo.cidade ?? "",
          estado: processo.estado ?? "",
        }
      : null,
    captador: processo.captador,
    fianca: processo.tipoFianca
      ? {
          tipo: processo.tipoFianca,
          nome: processo.fiancaNome ?? "",
          telefone: processo.fiancaTelefone ?? "",
          rg: processo.fiancaRg ?? "",
          cpf: processo.fiancaCpf ?? "",
        }
      : null,
    partes: processo.partes
      .filter((p) => p.tipo === "LOCADOR" || p.tipo === "LOCATARIO")
      .map((p) => ({
        tipo: p.tipo as "LOCADOR" | "LOCATARIO",
        nome: p.nome,
        telefone: p.telefone,
        rg: p.rg,
        cpf: p.cpf,
      })),
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Editar Processo {processo.numeroProcesso}
      </h1>

      <ProcessoForm
        action={async (formData: FormData) => {
          "use server";
          await editarProcesso(processo.id, formData);
        }}
        processoInicial={processoInicial}
      />
    </div>
  );
}
