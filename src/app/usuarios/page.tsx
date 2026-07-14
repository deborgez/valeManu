import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { excluirUsuario } from "./actions";

export default async function UsuariosPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const usuarios = await prisma.user.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Usuários</h1>
        <Link
          href="/usuarios/novo"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Novo Usuário
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Perfil</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t border-slate-100 dark:border-slate-700">
                <td className="px-4 py-2">{u.nome}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/usuarios/${u.id}`}
                    className="mr-3 text-slate-600 dark:text-slate-400 underline"
                  >
                    Editar
                  </Link>
                  {u.id !== session.user.id && (
                    <form
                      action={async () => {
                        "use server";
                        await excluirUsuario(u.id);
                      }}
                      className="inline"
                    >
                      <button type="submit" className="text-red-600 dark:text-red-400 underline">
                        Excluir
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
