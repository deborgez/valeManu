import PrestadorForm from "@/components/PrestadorForm";
import { criarPrestador } from "../actions";

export default function NovoPrestadorPage() {
  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Novo Prestador de Serviço
      </h1>
      <PrestadorForm action={criarPrestador} />
    </div>
  );
}
