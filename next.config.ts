import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Os arquivos agora sobem direto do navegador pro Vercel Blob (veja
    // src/components/inputs/BlobUploadInput.tsx), então as Server Actions só
    // recebem texto (URLs) — não precisam mais de um limite de corpo alto.
    serverActions: {
      bodySizeLimit: "5mb",
    },
    proxyClientMaxBodySize: "5mb",
  },
};

export default nextConfig;
