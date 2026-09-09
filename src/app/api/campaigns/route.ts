import { NextResponse } from 'next/server';
import { sql, isDbConfigured } from '../../../lib/db';
import { EARNING_APPS } from '../../../data/apps';

function mapCampaign(c: any) {
  return {
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
    isActive: c.is_active !== false,
    logoUrl: c.logo_url || undefined,
    referralCode: c.referral_code || undefined
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = parseInt(searchParams.get('limit') || '5');
    const country = searchParams.get('country') || 'All';
    const search = searchParams.get('search') || '';

    if (!isDbConfigured) {
      const filtered = EARNING_APPS.filter(app => {
        const matchesCountry = country === 'All' || !app.targetCountry || app.targetCountry === 'Global' || app.targetCountry.toLowerCase() === country.toLowerCase();
        const matchesSearch = !search || app.name.toLowerCase().includes(search.toLowerCase()) || app.category.toLowerCase().includes(search.toLowerCase());
        return matchesCountry && matchesSearch;
      });

      if (!page) {
        return NextResponse.json(filtered);
      }

      const pageNum = parseInt(page);
      const offset = (pageNum - 1) * limit;
      return NextResponse.json({
        campaigns: filtered.slice(offset, offset + limit),
        total: filtered.length,
        page: pageNum,
        totalPages: Math.ceil(filtered.length / limit)
      });
    }

    // Ensure columns exist (Self-migrating)
    try {
      await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS assigned_email VARCHAR(255)`;
      await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`;
      await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS logo_url TEXT`;
      await sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS referral_code VARCHAR(255)`;
    } catch (migErr) {
      console.warn("Migration warning for assigned_email/is_active/logo_url/referral_code column:", migErr);
    }

    if (!page) {
      const campaigns = await sql`SELECT * FROM campaigns ORDER BY created_at DESC`;
      const formattedCampaigns = campaigns.map(c => mapCampaign(c));
      return NextResponse.json(formattedCampaigns);
    }

    // Paginated server-side query
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limit;
    const searchPattern = `%${search.toLowerCase()}%`;

    let campaigns;
    let countRes;

    if (country === 'All') {
      campaigns = await sql`
        SELECT * FROM campaigns 
        WHERE (LOWER(name) LIKE ${searchPattern} OR LOWER(category) LIKE ${searchPattern})
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT COUNT(*) as count FROM campaigns 
        WHERE (LOWER(name) LIKE ${searchPattern} OR LOWER(category) LIKE ${searchPattern})
      `;
    } else {
      campaigns = await sql`
        SELECT * FROM campaigns 
        WHERE target_country = ${country} AND (LOWER(name) LIKE ${searchPattern} OR LOWER(category) LIKE ${searchPattern})
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT COUNT(*) as count FROM campaigns 
        WHERE target_country = ${country} AND (LOWER(name) LIKE ${searchPattern} OR LOWER(category) LIKE ${searchPattern})
      `;
    }

    const totalCount = parseInt(countRes[0]?.count || '0');
    const formattedCampaigns = campaigns.map(c => mapCampaign(c));

    return NextResponse.json({
      campaigns: formattedCampaigns,
      totalCount
    });
  } catch (error: any) {
    console.error('Error fetching campaigns from database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      category,
      platforms,
      earningRate,
      description,
      longDescription,
      tags,
      externalUrl,
      targetCountry,
      currency,
      currencySymbol,
      targetCompletions,
      videoUrl,
      reward,
      assignedEmail,
      isActive,
      logoUrl,
      referralCode
    } = body;

    const platformsStr = Array.isArray(platforms) ? platforms.join(',') : (platforms || 'Web');
    const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || '');
    const rewardNum = Number(reward) || 50.00;
    const compsCount = Number(targetCompletions) || 1000;
    const finalId = id || `custom-${Date.now()}`;
    const finalAssignedEmail = assignedEmail || null;
    const active = isActive !== undefined ? isActive : true;
    const finalLogoUrl = logoUrl || null;
    const finalReferralCode = referralCode || null;

    await sql`
      INSERT INTO campaigns (
        id, name, category, platforms, earning_rate, reward, 
        description, long_description, tags, external_url, 
        target_country, currency, currency_symbol, target_completions, video_url, assigned_email, is_active, logo_url, referral_code
      ) VALUES (
        ${finalId}, ${name}, ${category}, ${platformsStr}, ${earningRate}, ${rewardNum},
        ${description}, ${longDescription || description}, ${tagsStr}, ${externalUrl},
        ${targetCountry || 'India'}, ${currency || 'INR'}, ${currencySymbol || '₹'}, ${compsCount}, ${videoUrl || null}, ${finalAssignedEmail}, ${active}, ${finalLogoUrl}, ${finalReferralCode}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        platforms = EXCLUDED.platforms,
        earning_rate = EXCLUDED.earning_rate,
        reward = EXCLUDED.reward,
        description = EXCLUDED.description,
        long_description = EXCLUDED.long_description,
        tags = EXCLUDED.tags,
        external_url = EXCLUDED.external_url,
        target_country = EXCLUDED.target_country,
        currency = EXCLUDED.currency,
        currency_symbol = EXCLUDED.currency_symbol,
        target_completions = EXCLUDED.target_completions,
        video_url = EXCLUDED.video_url,
        assigned_email = EXCLUDED.assigned_email,
        is_active = EXCLUDED.is_active,
        logo_url = EXCLUDED.logo_url,
        referral_code = EXCLUDED.referral_code
    `;

    return NextResponse.json({ success: true, id: finalId });
  } catch (error: any) {
    console.error('Error creating/updating campaign in database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    await sql`DELETE FROM campaigns WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting campaign from database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
