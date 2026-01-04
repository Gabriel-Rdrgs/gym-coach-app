import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Validar DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL não está definida. Por favor, configure a variável de ambiente DATABASE_URL."
  );
}

// Criar pool de conexão PostgreSQL
let pool: Pool;
let adapter: PrismaPg;

try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Criar adapter do PostgreSQL
  adapter = new PrismaPg(pool);
} catch (error) {
  console.error("Erro ao criar pool de conexão PostgreSQL:", error);
  throw error;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

