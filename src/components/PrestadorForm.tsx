import TelefoneInput from "@/components/inputs/TelefoneInput";
import CpfInput from "@/components/inputs/CpfInput";

type Prestador = {
  nome: string;
  especialidade: string;
  telefone: string;
  cpf: string | null;
  email: string | null;
  observacoes: string | null;
};

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export default function PrestadorForm({
  action,
  prestador,
}: {
  action: (formData: FormData) => Promise<void>;
  prestador?: Prestador;
}) {
  return (
    <form
      action={action}
      className="max-w-xl rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
    >
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Nome
        </label>
        <input
          name="nome"
          required
          defaultValue={prestador?.nome}
          className={CAMPO_CLASSE}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Especialidade / Natureza do serviço
        </label>
        <input
          name="especialidade"
          required
          defaultValue={prestador?.especialidade}
          placeholder="Ex: Elétrica, Hidráulica, Pintura..."
          className={CAMPO_CLASSE}
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Telefone
          </label>
          <TelefoneInput
            name="telefone"
            required
            defaultValue={prestador?.telefone}
            className={CAMPO_CLASSE}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            CPF / CNPJ
          </label>
          <CpfInput
            name="cpf"
            defaultValue={prestador?.cpf ?? ""}
            className={CAMPO_CLASSE}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Email
        </label>
        <input
          name="email"
          type="email"
          defaultValue={prestador?.email ?? ""}
          className={CAMPO_CLASSE}
        />
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Observações
        </label>
        <textarea
          name="observacoes"
          defaultValue={prestador?.observacoes ?? ""}
          rows={3}
          className={CAMPO_CLASSE}
        />
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
