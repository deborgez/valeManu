import { auth } from "@/lib/auth";
import { podeEntregarVistoria } from "@/lib/perfis";
import { redirect } from "next/navigation";

export default async function VistoriasIndexPage() {
  const session = await auth();
  redirect(podeEntregarVistoria(session?.user.role) ? "/vistorias/solicitacoes" : "/vistorias/entrada");
}
