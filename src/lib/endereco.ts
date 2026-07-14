type EnderecoCampos = {
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
};

export function formatEndereco(m: EnderecoCampos): string {
  const ruaNumero = [m.rua, m.numero].filter(Boolean).join(", ");
  const linha1 = [ruaNumero, m.complemento].filter(Boolean).join(" - ");
  const cidadeEstado =
    m.cidade && m.estado ? `${m.cidade}/${m.estado}` : m.cidade || m.estado || "";
  const linha2 = [m.bairro, cidadeEstado].filter(Boolean).join(", ");
  const completo = [linha1, linha2].filter(Boolean).join(" - ");

  return completo || "Endereço não informado";
}
