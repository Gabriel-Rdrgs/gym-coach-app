/**
 * Testa Prisma 7 + adapter-pg FORA do Next.js.
 * Roda com: node scripts/test-prisma.mjs
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf-8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const [k, ...v] = l.split("=");
      return [k.trim(), v.join("=").trim().replace(/^"|"$/g, "")];
    })
);
const DATABASE_URL = env.DATABASE_URL || process.env.DATABASE_URL;

console.log("Node.js:", process.version);
console.log("Host:", new URL(DATABASE_URL).hostname);
console.log("");

// ── Teste 1: PrismaPg com PoolConfig (config object, SEM Pool externo) ────────
console.log("--- Teste 1: new PrismaPg({ connectionString, ssl }) ---");
try {
  const adapter = new PrismaPg({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
    connectionTimeoutMillis: 30000,
  });
  const p = new PrismaClient({ adapter });
  const r = await p.$queryRaw`SELECT 1 as ok`;
  console.log("✅ OK:", r);
  await p.$disconnect();
} catch (err) {
  console.error("❌ FALHOU:", err.message, "| código:", err.code);
}

// ── Teste 2: PrismaPg com Pool externo (nossa abordagem atual) ─────────────────
console.log("\n--- Teste 2: new PrismaPg(pool) — Pool externo ---");
try {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
    connectionTimeoutMillis: 30000,
  });
  const adapter = new PrismaPg(pool);
  const p = new PrismaClient({ adapter });
  const r = await p.$queryRaw`SELECT 1 as ok`;
  console.log("✅ OK:", r);
  await p.$disconnect();
  await pool.end();
} catch (err) {
  console.error("❌ FALHOU:", err.message, "| código:", err.code);
}

// ── Teste 3: PrismaPg com connectionString APENAS (docs oficiais) ──────────────
console.log("\n--- Teste 3: new PrismaPg({ connectionString }) — sem ssl explícito ---");
try {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL });
  const p = new PrismaClient({ adapter });
  const r = await p.$queryRaw`SELECT 1 as ok`;
  console.log("✅ OK:", r);
  await p.$disconnect();
} catch (err) {
  console.error("❌ FALHOU:", err.message, "| código:", err.code);
}

// ── Teste 4: tabela real ────────────────────────────────────────────────────────
console.log("\n--- Teste 4: query em tabela real (Workout) com Pool externo ---");
try {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
    connectionTimeoutMillis: 30000,
  });
  const adapter = new PrismaPg(pool);
  const p = new PrismaClient({ adapter });
  const r = await p.workout.findMany({ take: 1 });
  console.log("✅ OK:", r.length, "registro(s)");
  await p.$disconnect();
  await pool.end();
} catch (err) {
  console.error("❌ FALHOU:", err.message, "| código:", err.code);
}
