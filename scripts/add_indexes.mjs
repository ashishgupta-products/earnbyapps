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

console.log("Connecting to Neon PostgreSQL...");
const sql = neon(dbUrl);

const indexStatements = [
  // Users table indexes
  { name: 'idx_users_email_lower', sql: 'CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));' },
  { name: 'idx_users_created_at', sql: 'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);' },
  { name: 'idx_users_role', sql: 'CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);' },
  { name: 'idx_users_country', sql: 'CREATE INDEX IF NOT EXISTS idx_users_country ON users (country);' },

  // Submissions table indexes
  { name: 'idx_submissions_user_email_lower', sql: 'CREATE INDEX IF NOT EXISTS idx_submissions_user_email_lower ON submissions (LOWER(user_email));' },
  { name: 'idx_submissions_user_email', sql: 'CREATE INDEX IF NOT EXISTS idx_submissions_user_email ON submissions (user_email);' },
  { name: 'idx_submissions_status', sql: 'CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions (status);' },
  { name: 'idx_submissions_app_id', sql: 'CREATE INDEX IF NOT EXISTS idx_submissions_app_id ON submissions (app_id);' },
  { name: 'idx_submissions_created_at', sql: 'CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions (created_at DESC);' },
  { name: 'idx_submissions_origin_app_id', sql: 'CREATE INDEX IF NOT EXISTS idx_submissions_origin_app_id ON submissions (origin_app_id);' },

  // Payout requests table indexes
  { name: 'idx_payouts_user_email_lower', sql: 'CREATE INDEX IF NOT EXISTS idx_payouts_user_email_lower ON payout_requests (LOWER(user_email));' },
  { name: 'idx_payouts_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payout_requests (user_id);' },
  { name: 'idx_payouts_status', sql: 'CREATE INDEX IF NOT EXISTS idx_payouts_status ON payout_requests (status);' },
  { name: 'idx_payouts_created_at', sql: 'CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON payout_requests (created_at DESC);' },

  // Campaigns table indexes
  { name: 'idx_campaigns_country', sql: 'CREATE INDEX IF NOT EXISTS idx_campaigns_country ON campaigns (target_country);' },
  { name: 'idx_campaigns_is_active', sql: 'CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON campaigns (is_active);' },
  { name: 'idx_campaigns_created_at', sql: 'CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns (created_at DESC);' },
  { name: 'idx_campaigns_category', sql: 'CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns (category);' }
];

async function run() {
  console.log(`Starting to apply ${indexStatements.length} indexes...`);
  let successCount = 0;
  for (const item of indexStatements) {
    try {
      await sql.query(item.sql);
      console.log(`✓ Created/Verified index: ${item.name}`);
      successCount++;
    } catch (err) {
      console.warn(`! Skipped index ${item.name} (${err.message})`);
    }
  }

  // Check if payment_methods table exists before indexing it
  try {
    const pmTable = await sql.query("SELECT to_regclass('public.payment_methods') as exists;");
    if (pmTable[0]?.exists) {
      await sql.query('CREATE INDEX IF NOT EXISTS idx_payment_methods_country ON payment_methods (target_country);');
      await sql.query('CREATE INDEX IF NOT EXISTS idx_payment_methods_is_active ON payment_methods (is_active);');
      console.log(`✓ Created/Verified index: payment_methods indexes`);
      successCount += 2;
    }
  } catch (e) {
    // ignore
  }

  console.log(`\n🎉 Done! Successfully applied/verified ${successCount} database indexes.`);
}

run().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
});
