import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { criarUsuario } from "../actions";
import UsuarioForm from "@/components/UsuarioForm";

export default async function NovoUsuarioPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto w-full max-w-lg p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Novo Usuário
      </h1>

      <UsuarioForm action={criarUsuario} />
    </div>
  );
}
