import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';
import { getAuthenticatedUser } from '../../../lib/authHelper';
import { getCachedData, invalidateCache } from '../../../lib/cache';

async function ensurePayoutTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS payout_requests (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        user_email VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        payout_rail VARCHAR(50) NOT NULL,
        payout_details TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP
      );
    `;
  } catch (err) {
    console.warn("Table ensure warning for payout_requests in users route:", err);
  }
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);

    // Check if loading user by email
    const userEmailParam = searchParams.get('email');
    if (userEmailParam) {
      const normalizedEmail = userEmailParam.toLowerCase();
      const cacheKey = `user_profile_${normalizedEmail}`;

      const userData = await getCachedData(cacheKey, 15, async () => {
        const users = await sql`
          SELECT id, email, full_name, phone, gender, country, role, balance, payment_method, payment_details 
          FROM users 
          WHERE email = ${normalizedEmail}
        `;
        if (users.length === 0) return null;
        const u = users[0];
        return {
          id: String(u.id),
          name: u.full_name,
          email: u.email,
          phone: u.phone || 'N/A',
          paymentMethod: u.payment_method || 'UPI',
          paymentDetails: u.payment_details || 'N/A',
          balance: Number(u.balance || 0.00)
        };
      });

      if (!userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(userData, {
        headers: {
          'Cache-Control': 'private, max-age=5, stale-while-revalidate=15'
        }
      });
    }
    
    // Check if loading a single user with complete financial & task analytics
    const userIdParam = searchParams.get('userId');
    if (userIdParam) {
      const users = await sql`
        SELECT id, email, full_name, phone, gender, country, role, balance, payment_method, payment_details, is_blocked, created_at 
        FROM users 
        WHERE id = ${userIdParam}
      `;
      if (users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      const u = users[0];

      // Fetch payout requests for this user
      const payoutRows = await sql`
        SELECT id, user_id, user_email, user_name, amount, payout_rail, payout_details, status, created_at, processed_at
        FROM payout_requests
        WHERE user_id = ${String(u.id)} OR LOWER(user_email) = ${u.email.toLowerCase()}
        ORDER BY created_at DESC
      `;

      let totalCashedOut = 0;
      let pendingPayout = 0;
      let rejectedPayout = 0;

      const payoutHistory = payoutRows.map(p => {
        const amt = Number(p.amount || 0);
        if (p.status === 'Processed') totalCashedOut += amt;
        else if (p.status === 'Pending') pendingPayout += amt;
        else if (p.status === 'Rejected') rejectedPayout += amt;

        return {
          id: String(p.id),
          amount: amt,
          payoutRail: p.payout_rail || 'UPI',
          payoutDetails: p.payout_details || 'N/A',
          status: p.status || 'Pending',
          createdAt: p.created_at ? new Date(p.created_at).toISOString() : null,
          dateFormatted: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
          processedAt: p.processed_at ? new Date(p.processed_at).toISOString() : null
        };
      });

      // Fetch submissions for this user
      const submissionRows = await sql`
        SELECT id, user_name, user_email, app_name, app_id, reward, proof, proof_type, proof_url, status, created_at
        FROM submissions
        WHERE LOWER(user_email) = ${u.email.toLowerCase()}
        ORDER BY created_at DESC
      `;

      let totalTaskEarnings = 0;
      let pendingTaskEarnings = 0;
      let tasksDoneCount = 0;

      const submissionsHistory = submissionRows.map(s => {
        const rew = Number(s.reward || 0);
        if (s.status === 'Paid') {
          totalTaskEarnings += rew;
          tasksDoneCount++;
        } else if (s.status === 'Pending') {
          pendingTaskEarnings += rew;
        }

        return {
          id: String(s.id),
          appName: s.app_name || 'Task Campaign',
          appId: s.app_id,
          reward: rew,
          proof: s.proof || '',
          proofType: s.proof_type || 'text',
          proofUrl: s.proof_url || null,
          status: s.status || 'Pending',
          time: s.created_at ? new Date(s.created_at).toLocaleString() : 'N/A',
          createdAt: s.created_at ? new Date(s.created_at).toISOString() : null
        };
      });

      const walletBalance = Number(u.balance || 0.00);
      const lifetimeEarnings = Number((walletBalance + totalCashedOut + pendingPayout).toFixed(2));

      const formattedUser = {
        id: String(u.id),
        name: u.full_name,
        email: u.email,
        phone: u.phone || 'N/A',
        gender: u.gender || 'N/A',
        paymentMethod: u.payment_method || 'UPI',
        upi: u.payment_details || 'N/A',
        country: u.country || 'India',
        tasksDone: tasksDoneCount,
        isBlocked: !!u.is_blocked,
        lastLogin: u.created_at ? new Date(u.created_at).toLocaleString() : 'N/A',
        role: u.role === 'admin' ? 'Admin' : (u.role === 'partner' ? 'Partner' : 'Earner'),
        balance: walletBalance,
        totalCashedOut,
        pendingPayout,
        rejectedPayout,
        totalTaskEarnings,
        pendingTaskEarnings,
        lifetimeEarnings,
        payoutHistory,
        submissionsHistory
      };
      return NextResponse.json(formattedUser);
    }

    // Otherwise, perform server-side paginated queries
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || 'All Countries';
    
    const offset = (page - 1) * limit;
    const searchPattern = `%${search.toLowerCase()}%`;

    let dbUsers;
    let countRes;

    if (country === 'All Countries') {
      const [dbUsersRes, countQueryRes] = await Promise.all([
        sql`
          SELECT u.id, u.email, u.full_name, u.phone, u.gender, u.country, u.role, u.balance, u.payment_method, u.payment_details, u.is_blocked, u.created_at,
            COALESCE(sub.count, 0) as tasks_done,
            COALESCE(payout_agg.pending_payout, 0) as pending_payout,
            COALESCE(payout_agg.total_cashed_out, 0) as total_cashed_out
          FROM users u
          LEFT JOIN (
            SELECT user_email, COUNT(*) as count 
            FROM submissions 
            WHERE status = 'Paid'
            GROUP BY user_email
          ) sub ON u.email = sub.user_email
          LEFT JOIN (
            SELECT 
              user_email,
              SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END) as pending_payout,
              SUM(CASE WHEN status = 'Processed' THEN amount ELSE 0 END) as total_cashed_out
            FROM payout_requests
            GROUP BY user_email
          ) payout_agg ON LOWER(u.email) = LOWER(payout_agg.user_email)
          WHERE (
            LOWER(u.full_name) LIKE ${searchPattern} OR
            LOWER(u.email) LIKE ${searchPattern} OR
            LOWER(COALESCE(u.phone, '')) LIKE ${searchPattern} OR
            LOWER(COALESCE(u.payment_details, '')) LIKE ${searchPattern} OR
            CAST(u.id AS TEXT) LIKE ${searchPattern}
          )
          ORDER BY u.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `,
        sql`
          SELECT COUNT(*) as count 
          FROM users u
          WHERE (
            LOWER(u.full_name) LIKE ${searchPattern} OR
            LOWER(u.email) LIKE ${searchPattern} OR
            LOWER(COALESCE(u.phone, '')) LIKE ${searchPattern} OR
            LOWER(COALESCE(u.payment_details, '')) LIKE ${searchPattern} OR
            CAST(u.id AS TEXT) LIKE ${searchPattern}
          )
        `
      ]);
      dbUsers = dbUsersRes;
      countRes = countQueryRes;
    } else {
      const [dbUsersRes, countQueryRes] = await Promise.all([
        sql`
          SELECT u.id, u.email, u.full_name, u.phone, u.gender, u.country, u.role, u.balance, u.payment_method, u.payment_details, u.is_blocked, u.created_at,
            COALESCE(sub.count, 0) as tasks_done,
            COALESCE(payout_agg.pending_payout, 0) as pending_payout,
            COALESCE(payout_agg.total_cashed_out, 0) as total_cashed_out
          FROM users u
          LEFT JOIN (
            SELECT user_email, COUNT(*) as count 
            FROM submissions 
            WHERE status = 'Paid'
            GROUP BY user_email
          ) sub ON u.email = sub.user_email
          LEFT JOIN (
            SELECT 
              user_email,
              SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END) as pending_payout,
              SUM(CASE WHEN status = 'Processed' THEN amount ELSE 0 END) as total_cashed_out
            FROM payout_requests
            GROUP BY user_email
          ) payout_agg ON LOWER(u.email) = LOWER(payout_agg.user_email)
          WHERE u.country = ${country} AND (
            LOWER(u.full_name) LIKE ${searchPattern} OR
            LOWER(u.email) LIKE ${searchPattern} OR
            LOWER(COALESCE(u.phone, '')) LIKE ${searchPattern} OR
            LOWER(COALESCE(u.payment_details, '')) LIKE ${searchPattern} OR
            CAST(u.id AS TEXT) LIKE ${searchPattern}
          )
          ORDER BY u.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `,
        sql`
          SELECT COUNT(*) as count 
          FROM users u
          WHERE u.country = ${country} AND (
            LOWER(u.full_name) LIKE ${searchPattern} OR
            LOWER(u.email) LIKE ${searchPattern} OR
            LOWER(COALESCE(u.phone, '')) LIKE ${searchPattern} OR
            LOWER(COALESCE(u.payment_details, '')) LIKE ${searchPattern} OR
            CAST(u.id AS TEXT) LIKE ${searchPattern}
          )
        `
      ]);
      dbUsers = dbUsersRes;
      countRes = countQueryRes;
    }

    const totalCount = parseInt(countRes[0]?.count || '0');

    const formattedUsers = dbUsers.map(u => ({
      id: String(u.id),
      name: u.full_name,
      email: u.email,
      phone: u.phone || 'N/A',
      gender: u.gender || 'N/A',
      upi: u.payment_details || 'N/A',
      country: u.country || 'India',
      tasksDone: parseInt(String(u.tasks_done || '0')),
      isBlocked: !!u.is_blocked,
      lastLogin: u.created_at ? new Date(u.created_at).toLocaleString() : 'N/A',
      role: u.role === 'admin' ? 'Admin' : (u.role === 'partner' ? 'Partner' : 'Earner'),
      balance: Number(u.balance || 0.00),
      pendingPayout: Number(u.pending_payout || 0.00),
      totalCashedOut: Number(u.total_cashed_out || 0.00)
    }));

    return NextResponse.json({
      users: formattedUsers,
      totalCount
    });
  } catch (error: any) {
    console.error('Error fetching users from Neon PostgreSQL database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, adjustAmount } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const amt = parseFloat(adjustAmount);
    if (isNaN(amt)) {
      return NextResponse.json({ error: 'Valid adjustment amount is required' }, { status: 400 });
    }

    // Update the balance directly in the database
    await sql`
      UPDATE users 
      SET balance = balance + ${amt} 
      WHERE id = ${userId}
    `;

    invalidateCache('user_profile_');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error adjusting user balance in database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action } = body; // action is 'block' or 'unblock'
    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and Action are required' }, { status: 400 });
    }

    const isBlocked = action === 'block';
    await sql`
      UPDATE users 
      SET is_blocked = ${isBlocked} 
      WHERE id = ${userId}
    `;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating block status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await sql`DELETE FROM users WHERE id = ${userId}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in to update profile.' }, { status: 401 });
    }

    const body = await request.json();
    const { email, fullName, phone, gender, paymentMethod, paymentDetails } = body;

    if (!email) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    // User can only update their own profile and payment details, unless admin
    if (authUser.role !== 'admin' && authUser.email !== normalizedEmail) {
      return NextResponse.json({ error: 'Forbidden: You can only update your own account.' }, { status: 403 });
    }

    await sql`
      UPDATE users 
      SET 
        full_name = COALESCE(${fullName || null}, full_name),
        phone = COALESCE(${phone || null}, phone),
        gender = COALESCE(${gender || null}, gender),
        payment_method = COALESCE(${paymentMethod || null}, payment_method),
        payment_details = COALESCE(${paymentDetails || null}, payment_details)
      WHERE LOWER(email) = ${normalizedEmail}
    `;

    invalidateCache(`user_profile_${normalizedEmail}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PATCH /api/users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

