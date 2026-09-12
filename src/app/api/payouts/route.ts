import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';
import { getAuthenticatedUser } from '../../../lib/authHelper';
import { invalidateCache } from '../../../lib/cache';

const MINIMUM_WITHDRAWAL_AMOUNT = 20.00;

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
        transaction_ref VARCHAR(255),
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP
      );
    `;
    try {
      await sql`ALTER TABLE payout_requests ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(255)`;
      await sql`ALTER TABLE payout_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT`;
    } catch (migErr) {
      // Column might already exist
    }
  } catch (err) {
    console.warn("Table ensure warning for payout_requests:", err);
  }
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    if (userEmail) {
      const targetEmail = userEmail.toLowerCase();
      // User can only view their own payout history unless they are an admin
      if (!authUser || (authUser.role !== 'admin' && authUser.email !== targetEmail)) {
        return NextResponse.json({ error: 'Unauthorized to view this payout history.' }, { status: 403 });
      }

      // Return history for a specific user
      const requests = await sql`
        SELECT * FROM payout_requests
        WHERE LOWER(user_email) = ${userEmail.toLowerCase()}
        ORDER BY created_at DESC
      `;
      return NextResponse.json({
        success: true,
        requests: requests.map(r => ({
          id: r.id,
          userName: r.user_name,
          userEmail: r.user_email,
          amount: Number(r.amount),
          payoutRail: r.payout_rail,
          payoutDetails: r.payout_details,
          status: r.status,
          transactionRef: r.transaction_ref || null,
          adminNotes: r.admin_notes || null,
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
          processedAt: r.processed_at ? new Date(r.processed_at).toLocaleString() : null
        }))
      });
    }

    // Admin view: require admin privileges to view platform payout queue
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required to view all payouts.' }, { status: 403 });
    }

    const allRequests = await sql`
      SELECT * FROM payout_requests
      ORDER BY created_at DESC
    `;

    // Query platform wallet balances
    let totalWalletBalance = 0;
    let fundedUsersCount = 0;
    try {
      const walletRes = await sql`
        SELECT 
          COALESCE(SUM(balance), 0) as total_wallet_balance,
          COUNT(CASE WHEN balance > 0 THEN 1 END) as funded_users_count
        FROM users
      `;
      if (walletRes.length > 0) {
        totalWalletBalance = Number(walletRes[0].total_wallet_balance || 0);
        fundedUsersCount = Number(walletRes[0].funded_users_count || 0);
      }
    } catch (e) {
      console.warn("Could not query user wallet aggregates:", e);
    }

    const formatted = allRequests.map(r => ({
      id: r.id,
      userId: r.user_id,
      name: r.user_name,
      email: r.user_email,
      amount: Number(r.amount),
      payoutRail: r.payout_rail,
      upi: r.payout_details,
      status: r.status,
      transactionRef: r.transaction_ref || null,
      adminNotes: r.admin_notes || null,
      date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A',
      processedAt: r.processed_at ? new Date(r.processed_at).toLocaleString() : null
    }));

    const pendingSum = formatted
      .filter(p => p.status === 'Pending')
      .reduce((sum, p) => sum + p.amount, 0);

    const disbursedSum = formatted
      .filter(p => p.status === 'Processed')
      .reduce((sum, p) => sum + p.amount, 0);

    const rejectedSum = formatted
      .filter(p => p.status === 'Rejected')
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      success: true,
      requests: formatted,
      pendingCount: formatted.filter(p => p.status === 'Pending').length,
      pendingSum,
      disbursedSum,
      rejectedSum,
      totalWalletBalance,
      fundedUsersCount
    });
  } catch (error: any) {
    console.error('Error fetching payout requests:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const body = await request.json();
    const { amount, payoutRail, payoutDetails } = body;

    // Use authenticated user's email; fallback to body.email for mobile earner app
    const email = authUser
      ? ((authUser.role === 'admin' && body.email) ? String(body.email).toLowerCase() : authUser.email)
      : (body.email ? String(body.email).toLowerCase().trim() : null);

    if (!email) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in with your mobile app or account to withdraw.' },
        { status: 401 }
      );
    }

    if (authUser && authUser.isBlocked) {
      return NextResponse.json(
        { error: 'Your account has been blocked. Please contact support.' },
        { status: 403 }
      );
    }

    const withdrawAmt = parseFloat(amount);
    if (isNaN(withdrawAmt) || withdrawAmt <= 0) {
      return NextResponse.json({ error: 'Please enter a valid withdrawal amount.' }, { status: 400 });
    }

    if (withdrawAmt < MINIMUM_WITHDRAWAL_AMOUNT) {
      return NextResponse.json({
        error: `Minimum withdrawal amount is ₹${MINIMUM_WITHDRAWAL_AMOUNT.toFixed(2)}. Your requested amount is ₹${withdrawAmt.toFixed(2)}.`
      }, { status: 400 });
    }

    // Fetch user profile & live balance from database
    const users = await sql`
      SELECT id, full_name, email, balance, payment_method, payment_details 
      FROM users 
      WHERE LOWER(email) = ${email.toLowerCase()}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found in database.' }, { status: 404 });
    }

    const user = users[0];
    const currentBalance = Number(user.balance || 0);

    if (currentBalance < withdrawAmt) {
      return NextResponse.json({
        error: `Insufficient balance. Available: ₹${currentBalance.toFixed(2)}, Requested: ₹${withdrawAmt.toFixed(2)}.`
      }, { status: 400 });
    }

    // Determine final payout details
    const chosenRail = payoutRail || user.payment_method || 'upi';
    const chosenDetails = payoutDetails || user.payment_details;

    if (!chosenDetails || chosenDetails === 'N/A') {
      return NextResponse.json({
        error: 'Please configure your payout details (UPI ID / Bank details) before requesting a withdrawal.'
      }, { status: 400 });
    }

    const payoutId = `payout-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Deduct requested amount from user wallet balance
    await sql`
      UPDATE users 
      SET balance = balance - ${withdrawAmt} 
      WHERE LOWER(email) = ${email.toLowerCase()}
    `;

    invalidateCache(`user_profile_${email.toLowerCase()}`);

    // 2. Insert into payout_requests table
    await sql`
      INSERT INTO payout_requests (
        id, user_id, user_email, user_name, amount, payout_rail, payout_details, status
      ) VALUES (
        ${payoutId},
        ${String(user.id)},
        ${user.email},
        ${user.full_name || 'Earner User'},
        ${withdrawAmt},
        ${chosenRail},
        ${typeof chosenDetails === 'object' ? JSON.stringify(chosenDetails) : String(chosenDetails)},
        'Pending'
      )
    `;

    const newBalance = currentBalance - withdrawAmt;

    return NextResponse.json({
      success: true,
      message: `Withdrawal request for ₹${withdrawAmt.toFixed(2)} has been submitted successfully! Funds will be released via ${chosenRail.toUpperCase()} upon verification.`,
      newBalance,
      payoutId
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating payout request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required to process payouts.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, transactionRef, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Request ID and Status are required.' }, { status: 400 });
    }

    if (!['Processed', 'Rejected', 'Pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Allowed: Processed, Rejected, Pending.' }, { status: 400 });
    }

    // Fetch existing payout request
    const existing = await sql`
      SELECT * FROM payout_requests WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Payout request not found.' }, { status: 404 });
    }

    const req = existing[0];
    const oldStatus = req.status;
    const reqAmount = parseFloat(req.amount);

    if (status === 'Processed') {
      await sql`
        UPDATE payout_requests
        SET status = 'Processed', 
            processed_at = CURRENT_TIMESTAMP,
            transaction_ref = COALESCE(${transactionRef || null}, transaction_ref),
            admin_notes = COALESCE(${adminNotes || null}, admin_notes)
        WHERE id = ${id}
      `;
    } else if (status === 'Rejected') {
      // If was pending, refund amount back to user's wallet
      if (oldStatus === 'Pending') {
        await sql`
          UPDATE users
          SET balance = balance + ${reqAmount}
          WHERE LOWER(email) = ${req.user_email.toLowerCase()}
        `;
        invalidateCache(`user_profile_${req.user_email.toLowerCase()}`);
      }
      await sql`
        UPDATE payout_requests
        SET status = 'Rejected'
        WHERE id = ${id}
      `;
    } else if (status === 'Pending') {
      // If un-rejecting or resetting
      if (oldStatus === 'Rejected') {
        await sql`
          UPDATE users
          SET balance = balance - ${reqAmount}
          WHERE LOWER(email) = ${req.user_email.toLowerCase()}
        `;
      }
      await sql`
        UPDATE payout_requests
        SET status = 'Pending', processed_at = NULL
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error('Error updating payout request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
