import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import crypto from 'crypto';

// Standard CORS response headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, user: clientUser } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing idToken in request body.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. Verify ID token with Google's public tokeninfo endpoint
    const verifyUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken);
    const googleVerifyRes = await fetch(verifyUrl);

    if (!googleVerifyRes.ok) {
      const errData = await googleVerifyRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Invalid Google ID token.', details: errData.error_description || 'Token verification failed' },
        { status: 401, headers: corsHeaders }
      );
    }

    const googlePayload = await googleVerifyRes.json();

    // 2. Validate essential claims
    const email = googlePayload.email ? googlePayload.email.toLowerCase() : null;
    const googleSub = googlePayload.sub;
    const name = googlePayload.name || clientUser?.name || 'Google User';
    const picture = googlePayload.picture || clientUser?.picture || '';

    if (!email) {
      return NextResponse.json(
        { error: 'Google account does not have a verified email address.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Database operations
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS origin_app_id VARCHAR(100) DEFAULT 'main'`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255)`;
    } catch (migErr) {
      // Column might already exist
    }

    let user: any = null;
    const existingUsers = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (existingUsers.length > 0) {
      user = existingUsers[0];
      if (user.is_blocked) {
        return NextResponse.json(
          { error: 'This account has been blocked. Please contact support.' },
          { status: 403, headers: corsHeaders }
        );
      }

      // Update google_sub if not yet saved
      try {
        if (!user.google_sub && googleSub) {
          await sql`UPDATE users SET google_sub = ${googleSub} WHERE id = ${user.id}`;
        }
      } catch (e) {}
    } else {
      // Create new user in Neon database
      const newId = crypto.randomUUID();
      const adminEmails = [
        'admin@earnbyapps.com',
        'mayank.gupta.dev.1@gmail.com',
        'aashish.gupta.mails@gmail.com'
      ];
      const role = adminEmails.includes(email) ? 'admin' : 'user';

      await sql`
        INSERT INTO users (id, email, full_name, role, balance, origin_app_id, google_sub)
        VALUES (${newId}, ${email}, ${name}, ${role}, 0.00, 'mobile', ${googleSub})
      `;

      const created = await sql`SELECT * FROM users WHERE email = ${email}`;
      user = created[0] || {
        id: newId,
        email,
        full_name: name,
        role,
        balance: 0.00,
      };
    }

    // 4. Issue a secure session JWT token for the mobile app
    const sessionToken = signToken(
      {
        id: String(user.id),
        email: user.email,
        role: user.role,
        source: 'mobile'
      },
      30 * 24 * 60 * 60 // 30 days expiry
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Authenticated successfully with EarnByApps backend',
        token: sessionToken,
        user: {
          id: String(user.id),
          email: user.email,
          name: user.full_name,
          role: user.role,
          balance: Number(user.balance || 0.00),
          picture,
          originAppId: user.origin_app_id || 'mobile',
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Mobile Google Auth API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during authentication.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
