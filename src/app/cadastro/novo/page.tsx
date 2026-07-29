import { criarProcesso } from "../actions";
import ProcessoForm from "@/components/inputs/ProcessoForm";

export default function NovoProcessoPage() {
  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Novo Processo — Cadastro
      </h1>

      <ProcessoForm action={criarProcesso} />
    </div>
  );
}
