import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[match[1].trim()] = val;
      }
    }
  }
}

loadEnv();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const sql = neon(dbUrl);

async function benchmark() {
  console.log("=== NEON DB LATENCY BENCHMARK FROM CURRENT ENVIRONMENT ===");
  
  // Test 1: Simple SELECT 1 (measuring cold start / initial handshake)
  const t0 = performance.now();
  await sql`SELECT 1 as ping`;
  const t1 = performance.now();
  console.log(`Query 1 (Initial handshake / wake-up ping): ${(t1 - t0).toFixed(1)} ms`);

  // Test 2: Repeat SELECT 1 (measuring warm connection)
  const t2 = performance.now();
  await sql`SELECT 1 as ping`;
  const t3 = performance.now();
  console.log(`Query 2 (Warm connection ping): ${(t3 - t2).toFixed(1)} ms`);

  // Test 3: Campaigns query
  const t4 = performance.now();
  const campaigns = await sql`SELECT * FROM campaigns ORDER BY created_at DESC`;
  const t5 = performance.now();
  console.log(`Query 3 (Fetch all campaigns - ${campaigns.length} rows): ${(t5 - t4).toFixed(1)} ms`);

  // Test 4: Users count query
  const t6 = performance.now();
  const count = await sql`SELECT COUNT(*) FROM users`;
  const t7 = performance.now();
  console.log(`Query 4 (Fetch users count): ${(t7 - t6).toFixed(1)} ms`);

  console.log("==========================================================");
}

benchmark().catch(err => console.error("Benchmark failed:", err));
