import { criarProcesso } from "../actions";
import NumeroProcessoInput from "@/components/inputs/NumeroProcessoInput";
import EnderecoComCep from "@/components/inputs/EnderecoComCep";
import FiancaFields from "@/components/inputs/FiancaFields";
import PartesFields from "@/components/inputs/PartesFields";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export default function NovoProcessoPage() {
  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Novo Processo — Cadastro
      </h1>

      <form
        action={criarProcesso}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
      >
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Número do Processo
          </label>
          <NumeroProcessoInput name="numeroProcesso" required className={CAMPO_CLASSE} />
        </div>

        <PartesFields />

        <FiancaFields />

        <EnderecoComCep />

        <button
          type="submit"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Cadastrar Processo
        </button>
      </form>
    </div>
  );
}
