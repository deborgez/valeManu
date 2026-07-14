const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

type Usuario = {
  nome: string;
  email: string;
  role: string;
};

export default function UsuarioForm({
  action,
  usuario,
}: {
  action: (formData: FormData) => Promise<void>;
  usuario?: Usuario;
}) {
  const editando = Boolean(usuario);

  return (
    <form
      action={action}
      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
    >
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Nome
        </label>
        <input
          name="nome"
          required
          defaultValue={usuario?.nome}
          className={CAMPO_CLASSE}
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
          defaultValue={usuario?.email}
          className={CAMPO_CLASSE}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Senha {editando && "(deixe em branco para manter a atual)"}
        </label>
        <input
          name="senha"
          type="password"
          required={!editando}
          minLength={6}
          className={CAMPO_CLASSE}
        />
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Perfil
        </label>
        <select
          name="role"
          defaultValue={usuario?.role ?? "USER"}
          className={CAMPO_CLASSE}
        >
          <option value="USER">Usuário</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      <button
        type="submit"
        className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
      >
        Salvar
      </button>
    </form>
  );
}
