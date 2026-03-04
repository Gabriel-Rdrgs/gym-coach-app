/**
 * Teste de conexão direta com pg (sem Prisma).
 * Roda com: node scripts/test-connection.mjs
 * (ou: NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/test-connection.mjs)
 */
import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Ler .env manualmente (sem dotenv)
const envFile = resolve(process.cwd(), '.env');
const envVars = Object.fromEntries(
  readFileSync(envFile, 'utf-8')
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => {
      const [k, ...v] = l.split('=');
      return [k.trim(), v.join('=').trim().replace(/^"|"$/g, '')];
    })
);

const DATABASE_URL = envVars.DATABASE_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL não encontrada em .env'); process.exit(1); }

console.log('DATABASE_URL (host):', new URL(DATABASE_URL).hostname);
console.log('NODE_TLS_REJECT_UNAUTHORIZED:', process.env.NODE_TLS_REJECT_UNAUTHORIZED ?? '(não definido)');
console.log('Node.js version:', process.version);
console.log('pg version:', pg.defaults.parseInputDatesAsUTC !== undefined ? 'pg >= 8.x' : 'pg < 8.x');
console.log('\nTestando conexão...\n');

const { Pool } = pg;

// Teste 1: com ssl: { rejectUnauthorized: false }
async function test(label, config) {
  const pool = new Pool(config);
  const start = Date.now();
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT 1 AS ok, version() AS pg_version');
    console.log(`✅ ${label}: OK em ${Date.now() - start}ms`);
    console.log('   PostgreSQL:', result.rows[0].pg_version.split(' ')[0], result.rows[0].pg_version.split(' ')[1]);
    client.release();
  } catch (err) {
    console.error(`❌ ${label}: FALHOU em ${Date.now() - start}ms`);
    console.error('   Código:', err.code);
    console.error('   Mensagem:', err.message);
  } finally {
    await pool.end().catch(() => {});
  }
}

await test('ssl: { rejectUnauthorized: false }', {
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

await test('ssl: true', {
  connectionString: DATABASE_URL,
  ssl: true,
  connectionTimeoutMillis: 10000,
});

await test('sem ssl (fallback automático)', {
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 10000,
});
