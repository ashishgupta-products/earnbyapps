import { NextResponse } from 'next/server';
import { sql, isDbConfigured } from '../../../lib/db';

const FALLBACK_INDEPENDENT_APPS = [
  {
    id: 'indep-angelone',
    appName: 'Angel One Demat & Trading',
    appImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=160&auto=format&fit=crop&q=80',
    description: 'Complete paperless Aadhaar & PAN KYC verification. Instant demat account activation and direct cash reward credited to your bank.',
    referralCode: 'ANGELDIRECT',
    appLink: 'https://angelone.in/referral?ref=ANGELDIRECT',
    rewardBadge: '₹250 Direct Cash',
    category: 'Finance & Trading',
    isActive: true,
    createdAt: '2026-09-12'
  },
  {
    id: 'indep-groww',
    appName: 'Groww: Stocks & Mutual Funds',
    appImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=160&auto=format&fit=crop&q=80',
    description: 'Open a zero-maintenance Demat account on Groww. Complete KYC to receive instant cashback sent straight to your primary bank account.',
    referralCode: 'GROWW2026',
    appLink: 'https://groww.in/open-demat-account?invite=GROWW2026',
    rewardBadge: '₹150 Instant Credit',
    category: 'Finance & Trading',
    isActive: true,
    createdAt: '2026-09-11'
  },
  {
    id: 'indep-winzo',
    appName: 'WinZO Games: Play & Win',
    appImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=160&auto=format&fit=crop&q=80',
    description: 'Download verified Android APK and play casual games. Sign up with invite code for instant ₹50 wallet cash redeemable via UPI.',
    referralCode: 'WINZO50',
    appLink: 'https://winzogames.com/install?ref=WINZO50',
    rewardBadge: '₹50 Signup Bonus',
    category: 'Casual Gaming',
    isActive: true,
    createdAt: '2026-09-10'
  },
  {
    id: 'indep-swagbucks',
    appName: 'Swagbucks India Surveys',
    appImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=160&auto=format&fit=crop&q=80',
    description: 'Participate in everyday consumer opinion surveys. Zero waiting time—rewards are credited and transferred directly via PayPal or gift cards.',
    referralCode: 'SWAG2026',
    appLink: 'https://www.swagbucks.com/register?r=SWAG2026',
    rewardBadge: '₹100 Direct Voucher',
    category: 'Opinion Surveys',
    isActive: true,
    createdAt: '2026-09-09'
  },
  {
    id: 'indep-navi',
    appName: 'Navi: UPI, Loans & Digital Gold',
    appImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=160&auto=format&fit=crop&q=80',
    description: 'Setup Navi UPI and make a minimum digital gold purchase of ₹10 to unlock a flat ₹100 direct cashback deposited into your UPI linked bank.',
    referralCode: 'NAVI100',
    appLink: 'https://navi.com/referral?code=NAVI100',
    rewardBadge: '₹100 Direct Cashback',
    category: 'UPI & Banking',
    isActive: true,
    createdAt: '2026-09-08'
  }
];

export async function GET() {
  try {
    if (isDbConfigured) {
      const rows = await sql`
        SELECT 
          id, 
          app_name as "appName", 
          app_image as "appImage", 
          description, 
          referral_code as "referralCode", 
          app_link as "appLink", 
          reward_badge as "rewardBadge", 
          is_active as "isActive", 
          to_char(created_at, 'YYYY-MM-DD') as "createdAt"
        FROM independent 
        WHERE is_active = true 
        ORDER BY created_at DESC;
      `;

      if (rows && rows.length > 0) {
        return NextResponse.json({ success: true, apps: rows });
      }
    }

    return NextResponse.json({ success: true, apps: FALLBACK_INDEPENDENT_APPS });
  } catch (error: any) {
    console.error('Error fetching independent apps:', error);
    return NextResponse.json({ success: true, apps: FALLBACK_INDEPENDENT_APPS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appName, appImage, description, referralCode, appLink, rewardBadge } = body;

    if (!appName || !appLink) {
      return NextResponse.json({ success: false, error: 'App name and app link are required.' }, { status: 400 });
    }

    const id = `indep-${Date.now()}`;
    const badge = rewardBadge || 'Direct Reward';

    if (isDbConfigured) {
      await sql`
        INSERT INTO independent (id, app_name, app_image, description, referral_code, app_link, reward_badge, is_active)
        VALUES (${id}, ${appName}, ${appImage || ''}, ${description || ''}, ${referralCode || ''}, ${appLink}, ${badge}, true);
      `;
    }

    return NextResponse.json({
      success: true,
      app: {
        id,
        appName,
        appImage,
        description,
        referralCode,
        appLink,
        rewardBadge: badge,
        createdAt: new Date().toISOString().split('T')[0]
      }
    });
  } catch (error: any) {
    console.error('Error creating independent app:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
