import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if loading user by email
    const userEmailParam = searchParams.get('email');
    if (userEmailParam) {
      const users = await sql`
        SELECT id, email, full_name, phone, gender, country, role, balance, payment_method, payment_details 
        FROM users 
        WHERE email = ${userEmailParam.toLowerCase()}
      `;
      if (users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const u = users[0];
      return NextResponse.json({
        id: String(u.id),
        name: u.full_name,
        email: u.email,
        phone: u.phone || 'N/A',
        paymentMethod: u.payment_method || 'UPI',
        paymentDetails: u.payment_details || 'N/A',
        balance: Number(u.balance || 0.00)
      });
    }
    
    // Check if loading a single user
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

      // Count tasks completed from submissions
      const submissionCountRes = await sql`
        SELECT COUNT(*) as count 
        FROM submissions 
        WHERE user_email = ${u.email} AND status = 'Paid'
      `;
      const tasksDoneCount = parseInt(submissionCountRes[0]?.count || '0');

      const formattedUser = {
        id: String(u.id),
        name: u.full_name,
        email: u.email,
        phone: u.phone || 'N/A',
        gender: u.gender || 'N/A',
        upi: u.payment_details || 'N/A',
        country: u.country || 'India',
        tasksDone: tasksDoneCount,
        isBlocked: !!u.is_blocked,
        lastLogin: u.created_at ? new Date(u.created_at).toLocaleString() : 'N/A',
        role: u.role === 'admin' ? 'Admin' : (u.role === 'partner' ? 'Partner' : 'Earner'),
        balance: Number(u.balance || 0.00)
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
      dbUsers = await sql`
        SELECT u.id, u.email, u.full_name, u.phone, u.gender, u.country, u.role, u.balance, u.payment_method, u.payment_details, u.is_blocked, u.created_at,
          COALESCE(sub.count, 0) as tasks_done
        FROM users u
        LEFT JOIN (
          SELECT user_email, COUNT(*) as count 
          FROM submissions 
          WHERE status = 'Paid'
          GROUP BY user_email
        ) sub ON u.email = sub.user_email
        WHERE (
          LOWER(u.full_name) LIKE ${searchPattern} OR
          LOWER(u.email) LIKE ${searchPattern} OR
          LOWER(COALESCE(u.phone, '')) LIKE ${searchPattern} OR
          LOWER(COALESCE(u.payment_details, '')) LIKE ${searchPattern} OR
          CAST(u.id AS TEXT) LIKE ${searchPattern}
        )
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      countRes = await sql`
        SELECT COUNT(*) as count 
        FROM users u
        WHERE (
          LOWER(u.full_name) LIKE ${searchPattern} OR
          LOWER(u.email) LIKE ${searchPattern} OR
          LOWER(COALESCE(u.phone, '')) LIKE ${searchPattern} OR
          LOWER(COALESCE(u.payment_details, '')) LIKE ${searchPattern} OR
          CAST(u.id AS TEXT) LIKE ${searchPattern}
        )
      `;
    } else {
      dbUsers = await sql`
        SELECT u.id, u.email, u.full_name, u.phone, u.gender, u.country, u.role, u.balance, u.payment_method, u.payment_details, u.is_blocked, u.created_at,
          COALESCE(sub.count, 0) as tasks_done
        FROM users u
        LEFT JOIN (
          SELECT user_email, COUNT(*) as count 
          FROM submissions 
          WHERE status = 'Paid'
          GROUP BY user_email
        ) sub ON u.email = sub.user_email
        WHERE u.country = ${country} AND (
          LOWER(u.full_name) LIKE ${searchPattern} OR
          LOWER(u.email) LIKE ${searchPattern} OR
          LOWER(COALESCE(u.phone, '')) LIKE ${searchPattern} OR
          LOWER(COALESCE(u.payment_details, '')) LIKE ${searchPattern} OR
          CAST(u.id AS TEXT) LIKE ${searchPattern}
        )
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      countRes = await sql`
        SELECT COUNT(*) as count 
        FROM users u
        WHERE u.country = ${country} AND (
          LOWER(u.full_name) LIKE ${searchPattern} OR
          LOWER(u.email) LIKE ${searchPattern} OR
          LOWER(COALESCE(u.phone, '')) LIKE ${searchPattern} OR
          LOWER(COALESCE(u.payment_details, '')) LIKE ${searchPattern} OR
          CAST(u.id AS TEXT) LIKE ${searchPattern}
        )
      `;
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
      balance: Number(u.balance || 0.00)
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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error adjusting user balance in database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
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
    const body = await request.json();
    const { email, fullName, phone, gender, paymentMethod, paymentDetails } = body;

    if (!email) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    await sql`
      UPDATE users 
      SET 
        full_name = COALESCE(${fullName || null}, full_name),
        phone = COALESCE(${phone || null}, phone),
        gender = COALESCE(${gender || null}, gender),
        payment_method = COALESCE(${paymentMethod || null}, payment_method),
        payment_details = COALESCE(${paymentDetails || null}, payment_details)
      WHERE LOWER(email) = ${email.toLowerCase()}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PATCH /api/users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

