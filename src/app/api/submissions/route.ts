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
      const rawProofUrl = r.proof_url || (typeof r.proof === 'string' && (r.proof.startsWith('http://') || r.proof.startsWith('https://') || r.proof.startsWith('data:image/') || r.proof.startsWith('/uploads/')) ? r.proof : undefined);
      return {
        id: r.id,
        userName: r.user_name,
        userEmail: r.user_email,
        appName: r.app_name,
        appId: r.app_id,
        reward: Number(r.reward),
        proof: r.proof,
        proofType: (r.proof_type || (rawProofUrl ? 'image' : 'text')) as 'image' | 'video' | 'text',
        proofUrl: rawProofUrl,
        status: r.status as 'Pending' | 'Paid' | 'Rejected',
        time: timeStr,
        verifierEmail: r.verifier_email || 'admin',
        verificationType: (r.verification_type || 'admin') as 'admin' | 'creator',
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

    const rawProof = proof || body.notes || body.description || 'Task completed';
    const finalProofUrl = 
      proofUrl || 
      body.proof_url || 
      body.screenshot || 
      body.screenshotUrl || 
      body.screenshot_url || 
      body.image || 
      body.imageUrl || 
      body.mediaUrl || 
      (typeof rawProof === 'string' && (rawProof.startsWith('http://') || rawProof.startsWith('https://') || rawProof.startsWith('data:image/') || rawProof.startsWith('/uploads/')) ? rawProof : null);

    const isVideo = finalProofUrl && (finalProofUrl.endsWith('.mp4') || finalProofUrl.endsWith('.webm') || finalProofUrl.includes('video'));
    const isImage = Boolean(finalProofUrl && !isVideo);
    const finalProofType = proofType || body.proof_type || (isVideo ? 'video' : isImage ? 'image' : 'text');
    const finalOriginAppId = originAppId || body.origin_app_id || 'main';
    const finalVerifierEmail = verifierEmail || body.verifier_email || 'admin';
    const finalVerificationType = verificationType || body.verification_type || 'admin';
    const finalSubmissionId = id || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    await sql`
      INSERT INTO submissions (
        id, user_name, user_email, app_name, app_id, reward,
        proof, proof_type, proof_url, status, verifier_email,
        verification_type, referral_slot_id, origin_app_id
      ) VALUES (
        ${finalSubmissionId}, ${userName || 'Anonymous'}, ${userEmail}, ${appName || 'Task App'}, ${appId}, ${reward || 0},
        ${rawProof}, ${finalProofType}, ${finalProofUrl || null}, ${status || 'Pending'}, ${finalVerifierEmail},
        ${finalVerificationType}, ${referralSlotId || null}, ${finalOriginAppId}
      )
    `;

    return NextResponse.json({ success: true, id: finalSubmissionId });
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

      const isApprovedStatus = (s: string) => s === 'Paid' || s === 'Approved';
      if (isApprovedStatus(status) && !isApprovedStatus(oldStatus)) {
        // Add to user balance
        await sql`
          UPDATE users
          SET balance = balance + ${rewardVal}
          WHERE LOWER(email) = ${sub.user_email.toLowerCase()}
        `;
      } else if (!isApprovedStatus(status) && isApprovedStatus(oldStatus)) {
        // Subtract from user balance
        await sql`
          UPDATE users
          SET balance = balance - ${rewardVal}
          WHERE LOWER(email) = ${sub.user_email.toLowerCase()}
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
