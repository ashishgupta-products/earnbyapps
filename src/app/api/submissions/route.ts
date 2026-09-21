import { NextResponse } from 'next/server';
import { sql, isDbConfigured } from '../../../lib/db';
import { getAuthenticatedUser } from '../../../lib/authHelper';
import { getCachedData, invalidateCache } from '../../../lib/cache';
import fs from 'fs';
import path from 'path';

function saveBase64Media(dataUri: string): string | null {
  try {
    const match = dataUri.match(/^data:([a-zA-Z0-9\/+-]+);base64,(.+)$/);
    if (!match) return null;
    const mime = match[1];
    const base64Data = match[2];
    const ext = mime.includes('png') ? '.png' : mime.includes('mp4') ? '.mp4' : mime.includes('webm') ? '.webm' : '.jpg';
    const filename = `proof_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadsDir, filename), Buffer.from(base64Data, 'base64'));
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Error persisting base64 media to disk:', err);
    return null;
  }
}

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
    const authUser = await getAuthenticatedUser(req);
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('appId');
    const userEmail = searchParams.get('userEmail');
    const originAppId = searchParams.get('originAppId');

    // If querying submissions for a specific user, verify identity
    if (userEmail) {
      const normalizedEmail = userEmail.toLowerCase();
      if (authUser && authUser.role !== 'admin' && authUser.role !== 'partner' && authUser.email !== normalizedEmail) {
        return NextResponse.json({ error: 'Unauthorized to view these submissions.' }, { status: 403 });
      }
    } else {
      // Querying all submissions requires admin or partner privileges
      if (!authUser || (authUser.role !== 'admin' && authUser.role !== 'partner')) {
        return NextResponse.json({ error: 'Forbidden: Admin or Partner privileges required.' }, { status: 403 });
      }
    }

    const cacheKey = `submissions_${userEmail || 'all'}_${appId || 'all'}_${originAppId || 'all'}`;

    const formatted = await getCachedData(cacheKey, 15, async () => {
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

      return rows.map((r: any) => {
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
    });

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'private, max-age=10, stale-while-revalidate=30'
      }
    });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in with your mobile app or account to submit tasks.' }, { status: 401 });
    }

    if (authUser.isBlocked) {
      return NextResponse.json({ error: 'Your account has been blocked. Please contact support.' }, { status: 403 });
    }

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
    let finalProofUrl = 
      proofUrl || 
      body.proof_url || 
      body.screenshot || 
      body.screenshotUrl || 
      body.screenshot_url || 
      body.image || 
      body.imageUrl || 
      body.mediaUrl || 
      (typeof rawProof === 'string' && (rawProof.startsWith('http://') || rawProof.startsWith('https://') || rawProof.startsWith('data:image/') || rawProof.startsWith('/uploads/')) ? rawProof : null);

    // If proof URL is a base64 data URI, write it to file storage to prevent PostgreSQL database bloat & high WAL
    if (finalProofUrl && finalProofUrl.startsWith('data:')) {
      const savedUrl = saveBase64Media(finalProofUrl);
      if (savedUrl) {
        finalProofUrl = savedUrl;
      }
    }

    // Sanitize rawProof text so massive base64 strings are never stored in the text column
    let sanitizedProofText = typeof rawProof === 'string' ? rawProof : 'Task completed';
    if (sanitizedProofText.startsWith('data:')) {
      sanitizedProofText = 'Uploaded screenshot proof';
    } else if (sanitizedProofText.length > 500) {
      sanitizedProofText = sanitizedProofText.substring(0, 500);
    }

    const isVideo = finalProofUrl && (finalProofUrl.endsWith('.mp4') || finalProofUrl.endsWith('.webm') || finalProofUrl.includes('video'));
    const isImage = Boolean(finalProofUrl && !isVideo);
    const finalProofType = proofType || body.proof_type || (isVideo ? 'video' : isImage ? 'image' : 'text');
    const finalOriginAppId = originAppId || body.origin_app_id || 'main';
    const finalVerifierEmail = verifierEmail || body.verifier_email || 'admin';
    const finalVerificationType = verificationType || body.verification_type || 'admin';
    const finalSubmissionId = id || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const finalUserEmail = (authUser.role === 'admin' && userEmail) ? userEmail.toLowerCase() : authUser.email;
    const finalUserName = userName || authUser.email.split('@')[0];

    await sql`
      INSERT INTO submissions (
        id, user_name, user_email, app_name, app_id, reward,
        proof, proof_type, proof_url, status, verifier_email,
        verification_type, referral_slot_id, origin_app_id
      ) VALUES (
        ${finalSubmissionId}, ${finalUserName}, ${finalUserEmail}, ${appName || 'Task App'}, ${appId}, ${reward || 0},
        ${sanitizedProofText}, ${finalProofType}, ${finalProofUrl || null}, ${status || 'Pending'}, ${finalVerifierEmail},
        ${finalVerificationType}, ${referralSlotId || null}, ${finalOriginAppId}
      )
    `;

    invalidateCache('submissions_');

    return NextResponse.json({ success: true, id: finalSubmissionId });
  } catch (error: any) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || (authUser.role !== 'admin' && authUser.role !== 'partner')) {
      return NextResponse.json({ error: 'Forbidden: Admin or Partner privileges required to review submissions.' }, { status: 403 });
    }

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
        invalidateCache(`user_profile_${sub.user_email.toLowerCase()}`);
      } else if (!isApprovedStatus(status) && isApprovedStatus(oldStatus)) {
        // Subtract from user balance
        await sql`
          UPDATE users
          SET balance = balance - ${rewardVal}
          WHERE LOWER(email) = ${sub.user_email.toLowerCase()}
        `;
        invalidateCache(`user_profile_${sub.user_email.toLowerCase()}`);
      }
    }

    await sql`
      UPDATE submissions
      SET status = ${status}
      WHERE id = ${id}
    `;

    invalidateCache('submissions_');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating submission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
