import { auth } from "@/lib/auth";
import { LABEL_PERFIL } from "@/lib/perfis";
import { alterarSenha } from "./actions";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

const MENSAGENS_ERRO: Record<string, string> = {
  curta: "A nova senha precisa ter pelo menos 8 caracteres.",
  diferente: "A confirmação não confere com a nova senha.",
  atual: "A senha atual está incorreta.",
};

export default async function ContaPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; ok?: string }>;
}) {
  const session = await auth();
  if (!session) return null;
  const { erro, ok } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">Minha conta</h1>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6 text-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-slate-900 dark:text-slate-100">
          <span className="text-slate-400 dark:text-slate-500">Nome: </span>
          {session.user.name}
        </p>
        <p className="text-slate-900 dark:text-slate-100">
          <span className="text-slate-400 dark:text-slate-500">E-mail: </span>
          {session.user.email}
        </p>
        <p className="text-slate-900 dark:text-slate-100">
          <span className="text-slate-400 dark:text-slate-500">Perfil: </span>
          {LABEL_PERFIL[session.user.role] ?? session.user.role}
        </p>
      </section>

      <form
        action={alterarSenha}
        className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
      >
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Trocar senha
        </h2>

        {erro && MENSAGENS_ERRO[erro] && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
            {MENSAGENS_ERRO[erro]}
          </p>
        )}
        {ok && (
          <p className="mb-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
            Senha alterada com sucesso.
          </p>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Senha atual
          </label>
          <input type="password" name="senhaAtual" required className={CAMPO_CLASSE} />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nova senha
            </label>
            <input type="password" name="novaSenha" required minLength={8} className={CAMPO_CLASSE} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirmar nova senha
            </label>
            <input
              type="password"
              name="confirmacao"
              required
              minLength={8}
              className={CAMPO_CLASSE}
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Salvar nova senha
        </button>
      </form>
    </div>
  );
}
