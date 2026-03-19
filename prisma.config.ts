import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "./prisma/schema.prisma",
  
  datasource: {
    url: "env:DATABASE_URL",  // Prisma 7 syntax — lê diretamente do .env
  },
  
  driverAdapter: {
    url: "env:DATABASE_URL",
    provider: "postgresql",
  },
  
  migrations: {
    path: "./prisma/migrations",
  },
})
