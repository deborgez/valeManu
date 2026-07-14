import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { atualizarUsuario } from "../actions";
import UsuarioForm from "@/components/UsuarioForm";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const usuario = await prisma.user.findUnique({ where: { id } });
  if (!usuario) notFound();

  const action = atualizarUsuario.bind(null, id);

  return (
    <div className="mx-auto w-full max-w-lg p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Editar Usuário
      </h1>

      <UsuarioForm action={action} usuario={usuario} />
    </div>
  );
}
