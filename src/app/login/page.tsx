import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const params = await searchParams;
  const imobiliaria = await prisma.imobiliaria.findUnique({
    where: { id: "singleton" },
  });

  async function handleLogin(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        senha: formData.get("senha"),
        redirectTo: "/",
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect("/login?erro=1");
      }
      throw error;
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50">
      <form
        action={handleLogin}
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          {imobiliaria?.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imobiliaria.logoUrl}
              alt={imobiliaria.nome}
              className="mb-4 h-16"
            />
          )}
          <h1 className="text-xl font-semibold text-slate-900">
            Sistema de Manutenções
          </h1>
        </div>

        {params?.erro && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            Email ou senha inválidos.
          </p>
        )}

        <label className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="mb-4 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">
          Senha
        </label>
        <input
          name="senha"
          type="password"
          required
          className="mb-6 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />

        <button
          type="submit"
          className="w-full rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
