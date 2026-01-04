import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações para produção
  output: 'standalone', // Para Docker
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
