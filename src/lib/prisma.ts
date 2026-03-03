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

const connectionString = process.env.DATABASE_URL!;
const isSupabase = connectionString.includes("supabase");
// Supabase: mais tempo para estabelecer conexão e SSL
const supabaseUrl =
  connectionString +
  (connectionString.includes("?") ? "&" : "?") +
  "connect_timeout=30";

// Supabase: adapter com PoolConfig — pool criado sob demanda pelo adapter (pode reduzir P1017).
// Outros: Pool explícito.
const adapter = isSupabase
  ? new PrismaPg({
      connectionString: supabaseUrl,
      connectionTimeoutMillis: 30000,
      max: 1,
      idleTimeoutMillis: 0,
      ssl: { rejectUnauthorized: false },
    })
  : new PrismaPg(
      new Pool({
        connectionString,
        connectionTimeoutMillis: 15000,
        idleTimeoutMillis: 30000,
        keepAlive: true,
        max: 10,
      })
    );

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

