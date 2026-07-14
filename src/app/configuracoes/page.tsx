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
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Configurações da Imobiliária
      </h1>

      {params?.salvo && (
        <p className="mb-4 rounded bg-green-50 dark:bg-green-950 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          Configurações salvas com sucesso.
        </p>
      )}

      <form
        action={atualizarImobiliaria}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
      >
        {imobiliaria?.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imobiliaria.logoUrl}
            alt="Logo atual"
            className="mb-4 h-16"
          />
        )}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Nome da Imobiliária
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

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Logo (opcional)
          </label>
          <BlobUploadInput name="logo" accept="image/*" />
        </div>

        <button
          type="submit"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
