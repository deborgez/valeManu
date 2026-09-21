import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { atualizarImobiliaria } from "./actions";
import TelefoneInput from "@/components/inputs/TelefoneInput";
import BlobUploadInput from "@/components/inputs/BlobUploadInput";
import { redirect } from "next/navigation";

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const imobiliaria = await prisma.imobiliaria.findUnique({
    where: { id: "singleton" },
  });

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Unidade
      </h1>

      <form
        action={atualizarImobiliaria}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
      >
        {(imobiliaria?.logoUrl || imobiliaria?.logoUrlDark) && (
          <div className="mb-4 flex gap-4">
            {imobiliaria?.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imobiliaria.logoUrl}
                alt="Logo atual (modo claro)"
                className="h-16 rounded border border-slate-200 bg-white p-2"
              />
            )}
            {imobiliaria?.logoUrlDark && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imobiliaria.logoUrlDark}
                alt="Logo atual (modo escuro)"
                className="h-16 rounded border border-slate-700 bg-slate-900 p-2"
              />
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Unidade
          </label>
          <input
            name="nome"
            required
            defaultValue={imobiliaria?.nome}
            className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Endereço
          </label>
          <input
            name="endereco"
            required
            defaultValue={imobiliaria?.endereco}
            className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Telefone
          </label>
          <TelefoneInput
            name="telefone"
            required
            defaultValue={imobiliaria?.telefone}
            className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            defaultValue={imobiliaria?.email}
            className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Logo — modo claro (opcional)
          </label>
          <BlobUploadInput name="logo" accept="image/*" />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Logo — modo escuro (opcional)
          </label>
          <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
            Usada no lugar da logo padrão quando o usuário estiver com o tema escuro ativado.
          </p>
          <BlobUploadInput name="logoDark" accept="image/*" />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="cursor-pointer rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
          >
            Salvar
          </button>
          {params?.salvo && (
            <p className="rounded bg-green-50 dark:bg-green-950 px-3 py-2 text-sm text-green-700 dark:text-green-400">
              Configurações salvas com sucesso.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
