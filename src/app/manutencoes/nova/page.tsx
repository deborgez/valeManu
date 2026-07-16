import { criarManutencao } from "../actions";
import CpfInput from "@/components/inputs/CpfInput";
import EnderecoComCep from "@/components/inputs/EnderecoComCep";
import NumeroProcessoInput from "@/components/inputs/NumeroProcessoInput";

const CAMPO_CLASSE =
  "w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100";

export default function NovaManutencaoPage() {
  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Nova Manutenção — Solicitação
      </h1>

      <form
        action={criarManutencao}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
      >
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Número do Processo
          </label>
          <NumeroProcessoInput
            name="numeroProcesso"
            required
            className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <EnderecoComCep />

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Solicitante
            </label>
            <select
              name="solicitanteTipo"
              required
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="LOCADOR">Locador</option>
              <option value="LOCATARIO">Locatário</option>
              <option value="IMOBILIARIA">Imobiliária</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome do solicitante (opcional)
            </label>
            <input
              name="solicitanteNome"
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            CPF do solicitante (opcional)
          </label>
          <CpfInput name="solicitanteCpf" className={CAMPO_CLASSE} />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Natureza
          </label>
          <select name="natureza" required className={CAMPO_CLASSE}>
            <option value="Preventiva">Preventiva</option>
            <option value="Corretiva">Corretiva</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Descrição do problema
          </label>
          <textarea
            name="descricaoProblema"
            required
            rows={4}
            className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Competência
            </label>
            <select
              name="competencia"
              required
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="LOCADOR">Locador</option>
              <option value="LOCATARIO">Locatário</option>
              <option value="IMOBILIARIA">Imobiliária</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="emergencial"
              name="emergencial"
              type="checkbox"
              className="h-4 w-4"
            />
            <label htmlFor="emergencial" className="text-sm text-slate-700 dark:text-slate-300">
              É emergencial
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="rounded bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          Criar Manutenção
        </button>
      </form>
    </div>
  );
}
