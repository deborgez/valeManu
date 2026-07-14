import PrestadorForm from "@/components/PrestadorForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { atualizarPrestador } from "../actions";

export default async function EditarPrestadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prestador = await prisma.prestador.findUnique({ where: { id } });
  if (!prestador) notFound();

  const action = atualizarPrestador.bind(null, id);

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Editar Prestador de Serviço
      </h1>
      <PrestadorForm action={action} prestador={prestador} />
    </div>
  );
}
