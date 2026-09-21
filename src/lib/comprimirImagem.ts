const LARGURA_MAXIMA = 1920;
const QUALIDADE = 0.8;
const TAMANHO_MINIMO_PARA_COMPRIMIR = 300 * 1024; // abaixo disso não vale a pena comprimir

// Redimensiona e comprime uma imagem no navegador antes do upload (JPEG/PNG -> WebP).
// Se algo falhar ou não valer a pena, devolve o arquivo original sem quebrar o envio.
export async function comprimirImagem(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }
  if (file.size < TAMANHO_MINIMO_PARA_COMPRIMIR) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, LARGURA_MAXIMA / bitmap.width);
    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, largura, altura);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", QUALIDADE)
    );
    if (!blob || blob.size >= file.size) return file;

    const novoNome = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], novoNome, { type: "image/webp" });
  } catch {
    return file;
  }
}
