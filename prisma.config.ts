// prisma.config.ts
import { defineConfig } from '@prisma/internals'

export default defineConfig({
  // Configuração para múltiplos ambientes
  datasourceOverrides: {
    // Local
    development: {
      url: process.env.DATABASE_URL
    },
    // Vercel Production
    production: {
      url: process.env.DATABASE_URL
    }
  }
})
