import { NextResponse } from 'next/server';
import { sql, isDbConfigured } from '../../../lib/db';

async function ensureSubmissionsTable() {
  if (!isDbConfigured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id VARCHAR(255) PRIMARY KEY,
      user_name VARCHAR(255) NOT NULL,
      user_email VARCHAR(255) NOT NULL,
      app_name VARCHAR(255) NOT NULL,
      app_id VARCHAR(255) NOT NULL,
      reward NUMERIC(10, 2) NOT NULL,
      proof TEXT NOT NULL,
      proof_type VARCHAR(50) DEFAULT 'text',
      proof_url TEXT,
      status VARCHAR(50) DEFAULT 'Pending',
      verifier_email VARCHAR(255) NOT NULL,
      verification_type VARCHAR(50) DEFAULT 'admin',
      referral_slot_id VARCHAR(255),
      origin_app_id VARCHAR(100) DEFAULT 'main',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS origin_app_id VARCHAR(100) DEFAULT 'main'`;
  } catch (migErr) {
    console.warn("Migration warning for submissions column origin_app_id:", migErr);
  }
  
  // Migration: Update existing 'Approved' submissions to 'Paid'
  try {
    await sql`UPDATE submissions SET status = 'Paid' WHERE status = 'Approved'`;
  } catch (migErr) {
    console.warn("Migration warning for updating Approved to Paid status:", migErr);
  }
}

export async function GET(req: Request) {
  if (!isDbConfigured) {
    return NextResponse.json([]);
  }

  try {
    await ensureSubmissionsTable();
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('appId');
    const userEmail = searchParams.get('userEmail');
    const originAppId = searchParams.get('originAppId');

    let rows;
    if (appId && userEmail) {
      rows = await sql`
        SELECT * FROM submissions 
        WHERE app_id = ${appId} AND user_email = ${userEmail}
        ORDER BY created_at DESC
      `;
    } else if (userEmail) {
      rows = await sql`
        SELECT * FROM submissions 
        WHERE user_email = ${userEmail}
        ORDER BY created_at DESC
      `;
    } else if (appId) {
      rows = await sql`
        SELECT * FROM submissions 
        WHERE app_id = ${appId}
        ORDER BY created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT * FROM submissions 
        ORDER BY created_at DESC
      `;
    }

    // Filter by origin_app_id if specified (handling NULL / default cases)
    if (originAppId) {
      rows = rows.filter(r => (r.origin_app_id || 'main') === originAppId);
    }

    const formatted = rows.map((r: any) => {
      let timeStr = 'Just now';
      if (r.created_at) {
        try {
          const d = new Date(r.created_at);
          if (!isNaN(d.getTime())) {
            timeStr = d.toLocaleString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          }
        } catch (e) {
          // fallback
        }
      }
      return {
        id: r.id,
        userName: r.user_name,
        userEmail: r.user_email,
        appName: r.app_name,
        appId: r.app_id,
        reward: Number(r.reward),
        proof: r.proof,
        proofType: r.proof_type as 'image' | 'video' | 'text',
        proofUrl: r.proof_url || undefined,
        status: r.status as 'Pending' | 'Paid' | 'Rejected',
        time: timeStr,
        verifierEmail: r.verifier_email,
        verificationType: r.verification_type as 'admin' | 'creator',
        referralSlotId: r.referral_slot_id || undefined,
        originAppId: r.origin_app_id || 'main'
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSubmissionsTable();
    const body = await req.json();
    const {
      id,
      userName,
      userEmail,
      appName,
      appId,
      reward,
      proof,
      proofType,
      proofUrl,
      status,
      verifierEmail,
      verificationType,
      referralSlotId,
      originAppId
    } = body;

    const finalProofType = proofType && proofType !== 'text' ? proofType : (proofUrl ? 'image' : 'text');
    const finalOriginAppId = originAppId || 'main';

    await sql`
      INSERT INTO submissions (
        id, user_name, user_email, app_name, app_id, reward,
        proof, proof_type, proof_url, status, verifier_email,
        verification_type, referral_slot_id, origin_app_id
      ) VALUES (
        ${id}, ${userName}, ${userEmail}, ${appName}, ${appId}, ${reward},
        ${proof}, ${finalProofType}, ${proofUrl || null}, ${status || 'Pending'}, ${verifierEmail},
        ${verificationType}, ${referralSlotId || null}, ${finalOriginAppId}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await ensureSubmissionsTable();
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    // Update user balance in the users table when verifier approves/rejects
    const subRes = await sql`SELECT user_email, reward, status FROM submissions WHERE id = ${id}`;
    if (subRes.length > 0) {
      const sub = subRes[0];
      const oldStatus = sub.status;
      const rewardVal = parseFloat(sub.reward);

      if (status === 'Paid' && oldStatus !== 'Paid') {
        // Add to user balance
        await sql`
          UPDATE users
          SET balance = balance + ${rewardVal}
          WHERE email = ${sub.user_email}
        `;
      } else if (status !== 'Paid' && oldStatus === 'Paid') {
        // Subtract from user balance
        await sql`
          UPDATE users
          SET balance = balance - ${rewardVal}
          WHERE email = ${sub.user_email}
        `;
      }
    }

    await sql`
      UPDATE submissions
      SET status = ${status}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating submission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
