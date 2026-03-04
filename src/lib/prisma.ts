import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Extend globalThis to safely hold singletons across Next.js hot reloads in dev.
const g = globalThis as typeof globalThis & {
  _prismaPool?: Pool;
  _prismaClient?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não está definida.");

const isSupabase = connectionString.includes("supabase");

// ── Pool singleton ────────────────────────────────────────────────────────────
// IMPORTANT: PrismaPg must receive a *Pool* (not a PoolConfig).
// When a PoolConfig is passed, PrismaPg creates a brand-new Pool on every
// adapter.connect() call (called per-request by Prisma's connection manager).
// Multiple simultaneous Pools exhaust Supabase's connection limit → P1017.
// When a Pool instance is passed, PrismaPg sets externalPool and ALL connect()
// calls share the same Pool.
if (!g._prismaPool) {
  g._prismaPool = new Pool({
    connectionString,
    ...(isSupabase && { ssl: { rejectUnauthorized: false } }),
    max: 3,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 60000,
    keepAlive: true,
  });

  g._prismaPool.on("error", (err) => {
    console.error("[pg pool] idle client error:", err.message);
  });
}

// ── PrismaClient singleton ────────────────────────────────────────────────────
if (!g._prismaClient) {
  g._prismaClient = new PrismaClient({
    adapter: new PrismaPg(g._prismaPool),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = g._prismaClient;
