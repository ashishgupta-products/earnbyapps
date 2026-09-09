import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db';
import { getAuthenticatedUser } from '../../../../lib/authHelper';

export async function GET(request: Request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    // Ensure columns exist (Self-migrating)
    try {
      await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS assigned_email VARCHAR(255)`;
      await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`;
      await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS logo_url TEXT`;
    } catch (migErr) {
      console.warn("Migration warning for assigned_email/is_active/logo_url column:", migErr);
    }

    const campaigns = await sql`
      SELECT * FROM campaigns 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `;
    
    // Map db columns to interface structure suitable for React Native
    const formattedCampaigns = campaigns.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      platforms: c.platforms ? c.platforms.split(',') : [],
      earningRate: c.earning_rate,
      averageEarningsPerDay: Number(c.reward),
      difficulty: 'Easy',
      rating: 5.0,
      reviewsCount: 1,
      description: c.description || '',
      longDescription: c.long_description || '',
      tags: c.tags ? c.tags.split(',') : [],
      actionText: `Launch ${c.name}`,
      externalUrl: c.external_url || '',
      targetCountry: c.target_country || 'India',
      currency: c.currency || 'INR',
      currencySymbol: c.currency_symbol || '₹',
      targetCompletions: Number(c.target_completions || 1000),
      videoUrl: c.video_url || undefined,
      reward: Number(c.reward),
      assignedEmail: c.assigned_email || undefined,
      logoUrl: c.logo_url || undefined,
      referralCode: c.referral_code || undefined
    }));

    return NextResponse.json(formattedCampaigns);
  } catch (error: any) {
    console.error('Error fetching campaigns for mobile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
