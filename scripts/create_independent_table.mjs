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
  console.error("Error: DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(dbUrl);

async function run() {
  console.log("Creating 'independent' table in Neon PostgreSQL...");
  await sql`
    CREATE TABLE IF NOT EXISTS independent (
      id VARCHAR(255) PRIMARY KEY,
      app_name VARCHAR(255) NOT NULL,
      app_image TEXT,
      description TEXT,
      referral_code VARCHAR(255),
      app_link TEXT NOT NULL,
      reward_badge VARCHAR(255) DEFAULT 'Direct Reward',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_independent_created_at ON independent (created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_independent_is_active ON independent (is_active);`;
  console.log("✓ Table 'independent' created successfully with indexes!");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
