import { ESPECIALIDADES_PRESTADOR } from "./labels";

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const REGRAS: { trechos: string[]; palavraInteira?: boolean; canonica: string }[] = [
  { trechos: ["seguranca", "portao eletronico", "alarme", "cftv", "camera"], canonica: "Segurança Eletrônica" },
  { trechos: ["pint"], canonica: "Pintura" },
  { trechos: ["hidraul", "encanad", "poco"], canonica: "Hidráulica" },
  { trechos: ["eletric"], canonica: "Elétrica" },
  { trechos: ["marcen", "carpint", "madeir"], canonica: "Marcenaria e Carpintaria" },
  { trechos: ["serralh"], canonica: "Serralheria" },
  { trechos: ["vidrac", "vidro"], canonica: "Vidraçaria" },
  { trechos: ["alvenar", "pedreir"], canonica: "Alvenaria" },
  { trechos: ["gesso", "drywall"], canonica: "Gesso e Drywall" },
  { trechos: ["piso", "revest"], canonica: "Pisos e Revestimentos" },
  { trechos: ["cobert", "imperme", "telhad"], canonica: "Coberturas e Impermeabilização" },
  { trechos: ["jardin", "paisag"], canonica: "Jardinagem e Paisagismo" },
  { trechos: ["limpez"], canonica: "Limpeza" },
  { trechos: ["climat", "refriger", "ar condicionado"], canonica: "Climatização e Refrigeração" },
  { trechos: ["chaveir"], canonica: "Chaveiro" },
  { trechos: ["praga"], canonica: "Controle de Pragas" },
  { trechos: ["piscin"], canonica: "Piscinas" },
  { trechos: ["gas"], palavraInteira: true, canonica: "Gás" },
  { trechos: ["engenh", "laudo"], canonica: "Engenharia/Laudos" },
  {
    trechos: ["servicos gerais", "marido de aluguel", "pequenos reparos", "reparos"],
    canonica: "Pequenos Reparos (Marido de Aluguel)",
  },
];

// Unifica nomes soltos (ex.: "Encanador", "Pintor", "Pinturas e Reparos") com a lista oficial.
export function especialidadeCanonica(texto: string): string {
  const original = texto.trim();
  const exata = ESPECIALIDADES_PRESTADOR.find((e) => normalizar(e) === normalizar(original));
  if (exata) return exata;

  const alvo = normalizar(original);
  const palavras = alvo.split(/[^a-z0-9]+/);
  for (const regra of REGRAS) {
    const bate = regra.trechos.some((t) =>
      t.includes(" ")
        ? alvo.includes(t)
        : palavras.some((p) => (regra.palavraInteira ? p === t : p.startsWith(t)))
    );
    if (bate) return regra.canonica;
  }
  return original;
}
