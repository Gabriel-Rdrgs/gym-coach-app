import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,

  // Prisma 7 usa WebAssembly como query engine quando driver adapters são usados.
  // Webpack não consegue carregar o Wasm do @prisma/client corretamente por padrão,
  // causando falhas silenciosas que resultam em P1017 em todas as queries.
  // A solução é externalizar esses pacotes para que o Node.js os carregue diretamente,
  // sem passar pelo bundler.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "@prisma/driver-adapter-utils",
    "pg",
    "pg-native",
  ],
  
  // DESABILITA TURBOPACK (resolve o erro de build)
  turbopack: false,
  
  // Configurações de imagens
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
