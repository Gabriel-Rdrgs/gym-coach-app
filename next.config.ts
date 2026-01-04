import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações para produção
  // output: 'standalone' removido - Vercel não precisa, apenas para Docker
  poweredByHeader: false, // Remove header X-Powered-By
  compress: true, // Habilita compressão gzip
  
  // Configurações de imagens
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Permite imagens de qualquer domínio HTTPS
      },
    ],
  },
};

export default nextConfig;
