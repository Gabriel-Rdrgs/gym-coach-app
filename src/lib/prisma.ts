import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  adapter: InstanceType<typeof PrismaPg> | undefined;
};

// Validar DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL não está definida. Por favor, configure a variável de ambiente DATABASE_URL."
  );
}

const connectionString = process.env.DATABASE_URL!;
const isSupabase = connectionString.includes("supabase");

function createPool(): Pool {
  if (globalForPrisma.pool) return globalForPrisma.pool;
  const pool = new Pool({
    connectionString: isSupabase
      ? connectionString + (connectionString.includes("?") ? "&" : "?") + "connect_timeout=30"
      : connectionString,
    connectionTimeoutMillis: 20000,
    idleTimeoutMillis: 60000,
    keepAlive: true,
    max: 5,
    ...(isSupabase && { ssl: { rejectUnauthorized: false } }),
  });
  if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;
  return pool;
}

function createAdapter(): InstanceType<typeof PrismaPg> {
  if (globalForPrisma.adapter) return globalForPrisma.adapter;
  const adapter = new PrismaPg(createPool());
  if (process.env.NODE_ENV !== "production") globalForPrisma.adapter = adapter;
  return adapter;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: createAdapter(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

