import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

const TIPOS_PERMITIDOS = ["image/", "video/", "application/pdf"];
const TAMANHO_MAXIMO = 500 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { filename, contentType, size } = (await request.json()) as {
      filename?: string;
      contentType?: string;
      size?: number;
    };

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
    }
    if (!TIPOS_PERMITIDOS.some((tipo) => contentType.startsWith(tipo))) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido." },
        { status: 400 }
      );
    }
    if (typeof size === "number" && size > TAMANHO_MAXIMO) {
      return NextResponse.json(
        { error: "Arquivo maior que o limite de 500MB." },
        { status: 400 }
      );
    }

    const extensao = filename.includes(".") ? filename.split(".").pop() : "";
    const sufixo = Math.random().toString(36).slice(2, 10);
    const chave = `${Date.now()}-${sufixo}${extensao ? `.${extensao}` : ""}`;

    const uploadUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: chave,
        ContentType: contentType,
      }),
      { expiresIn: 60 }
    );

    return NextResponse.json({
      uploadUrl,
      publicUrl: `${R2_PUBLIC_URL}/${chave}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
