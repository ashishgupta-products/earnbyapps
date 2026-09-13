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

const sampleEntries = [
  {
    id: 'indep-angelone',
    app_name: 'Angel One Demat & Trading',
    app_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=160&auto=format&fit=crop&q=80',
    description: 'Complete paperless Aadhaar & PAN KYC verification. Instant demat account activation and direct cash reward credited to your bank.',
    referral_code: 'ANGELDIRECT',
    app_link: 'https://angelone.in/referral?ref=ANGELDIRECT',
    reward_badge: '₹250 Direct Cash'
  },
  {
    id: 'indep-groww',
    app_name: 'Groww: Stocks & Mutual Funds',
    app_image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=160&auto=format&fit=crop&q=80',
    description: 'Open a zero-maintenance Demat account on Groww. Complete KYC to receive instant cashback sent straight to your primary bank account.',
    referral_code: 'GROWW2026',
    app_link: 'https://groww.in/open-demat-account?invite=GROWW2026',
    reward_badge: '₹150 Instant Credit'
  },
  {
    id: 'indep-winzo',
    app_name: 'WinZO Games: Play & Win',
    app_image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=160&auto=format&fit=crop&q=80',
    description: 'Download verified Android APK and play casual games. Sign up with invite code for instant ₹50 wallet cash redeemable via UPI.',
    referral_code: 'WINZO50',
    app_link: 'https://winzogames.com/install?ref=WINZO50',
    reward_badge: '₹50 Signup Bonus'
  },
  {
    id: 'indep-swagbucks',
    app_name: 'Swagbucks India Surveys',
    app_image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=160&auto=format&fit=crop&q=80',
    description: 'Participate in everyday consumer opinion surveys. Zero waiting time—rewards are credited and transferred directly via PayPal or gift cards.',
    referral_code: 'SWAG2026',
    app_link: 'https://www.swagbucks.com/register?r=SWAG2026',
    reward_badge: '₹100 Direct Voucher'
  },
  {
    id: 'indep-navi',
    app_name: 'Navi: UPI, Loans & Digital Gold',
    app_image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=160&auto=format&fit=crop&q=80',
    description: 'Setup Navi UPI and make a minimum digital gold purchase of ₹10 to unlock a flat ₹100 direct cashback deposited into your UPI linked bank.',
    referral_code: 'NAVI100',
    app_link: 'https://navi.com/referral?code=NAVI100',
    reward_badge: '₹100 Direct Cashback'
  }
];

async function seed() {
  console.log("Seeding entries into 'independent' table in Neon PostgreSQL...");

  for (const item of sampleEntries) {
    await sql`
      INSERT INTO independent (id, app_name, app_image, description, referral_code, app_link, reward_badge, is_active)
      VALUES (${item.id}, ${item.app_name}, ${item.app_image}, ${item.description}, ${item.referral_code}, ${item.app_link}, ${item.reward_badge}, true)
      ON CONFLICT (id) DO UPDATE SET
        app_name = EXCLUDED.app_name,
        app_image = EXCLUDED.app_image,
        description = EXCLUDED.description,
        referral_code = EXCLUDED.referral_code,
        app_link = EXCLUDED.app_link,
        reward_badge = EXCLUDED.reward_badge,
        is_active = EXCLUDED.is_active;
    `;
  }

  const rows = await sql`SELECT id, app_name, reward_badge FROM independent ORDER BY created_at DESC;`;
  console.log(`✓ Successfully seeded! Total rows in 'independent': ${rows.length}`);
  console.table(rows);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
