import { verifyToken } from './jwt';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sql } from './db';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

/**
 * Universal authentication helper for both Mobile App (Bearer JWT) and Web (NextAuth Session).
 * Validates token signature, extracts user identity, and verifies status against the database.
 */
export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | null> {
  try {
    let email: string | null = null;
    let userId: string | null = null;
    let role: string = 'user';

    // 1. Check Authorization: Bearer <token> (Primary method used by Mobile App)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token) {
        const decoded = verifyToken(token);
        if (decoded && (decoded.email || decoded.id)) {
          email = decoded.email ? decoded.email.toLowerCase() : null;
          userId = decoded.id ? String(decoded.id) : null;
          role = decoded.role || 'user';
        }
      }
    }

    // 2. Check NextAuth JWT Cookie / Token (Used by Web App)
    if (!email && !userId) {
      try {
        const nextAuthSecret = process.env.NEXTAUTH_SECRET || 'earnbyapps-super-secret-key-12345';
        const jwtPayload = await getToken({ 
          req: request as any, 
          secret: nextAuthSecret 
        });

        if (jwtPayload && jwtPayload.email) {
          email = jwtPayload.email.toLowerCase();
          role = (jwtPayload as any).role || 'user';
        }
      } catch (e) {
        // Fallback to getServerSession
      }
    }

    // 3. Fallback: Check getServerSession with authOptions (Next.js server-side session)
    if (!email && !userId) {
      try {
        const session = await getServerSession(authOptions);
        if (session && session.user?.email) {
          email = session.user.email.toLowerCase();
          role = (session.user as any).role || 'user';
        }
      } catch (e) {
        // Silent catch
      }
    }

    if (!email && !userId) {
      return null;
    }

    // 4. Verify user in database to ensure account is active and not blocked
    let dbUsers: any[] = [];
    if (email) {
      dbUsers = await sql`
        SELECT id, email, role, is_blocked 
        FROM users 
        WHERE LOWER(email) = ${email}
        LIMIT 1
      `;
    } else if (userId) {
      dbUsers = await sql`
        SELECT id, email, role, is_blocked 
        FROM users 
        WHERE id = ${userId}
        LIMIT 1
      `;
    }

    if (dbUsers.length === 0) {
      return null;
    }

    const u = dbUsers[0];
    return {
      id: String(u.id),
      email: u.email.toLowerCase(),
      role: u.role || role,
      isBlocked: Boolean(u.is_blocked),
    };
  } catch (error) {
    console.error('getAuthenticatedUser error:', error);
    return null;
  }
}
