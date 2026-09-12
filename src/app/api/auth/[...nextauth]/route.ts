import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql, isDbConfigured } from "../../../../lib/db";
import crypto from "crypto";

export const authOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        token: { label: "Token", type: "text" }
      },
      async authorize(credentials) {


        if (credentials?.token) {
          const { verifyToken } = require("../../../../lib/jwt");
          const decoded = verifyToken(credentials.token);
          if (decoded && decoded.id) {
            const users = await sql`SELECT * FROM users WHERE id = ${decoded.id}`;
            if (users.length > 0) {
              const user = users[0];
              if (user.is_blocked) {
                throw new Error("Your account has been blocked. Please contact support.");
              }
              return {
                id: String(user.id),
                email: user.email,
                name: user.full_name,
                role: user.role,
                balance: Number(user.balance || 0.00)
              };
            }
          }
          throw new Error("Invalid or expired session token");
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        // Ensure database table has the password column
        try {
          await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255)`;
        } catch (migErr) {
          console.warn("Migration warning for password column:", migErr);
        }

        // Find user by email
        const users = await sql`SELECT * FROM users WHERE email = ${credentials.email.toLowerCase()}`;
        if (users.length === 0) {
          throw new Error("No user found with this email");
        }

        const user = users[0];
        if (user.is_blocked) {
          throw new Error("Your account has been blocked. Please contact support.");
        }
        if (!user.password) {
          throw new Error("This account is configured with Google Sign In. Please use Google Sign In.");
        }

        // Hash the incoming password using SHA-256
        const hashedPassword = crypto.createHash("sha256").update(credentials.password).digest("hex");

        if (hashedPassword !== user.password) {
          throw new Error("Incorrect password");
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.full_name,
          role: user.role,
          balance: Number(user.balance || 0.00)
        };
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || "earnbyapps-super-secret-key-12345",
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      if (user && user.email && isDbConfigured) {
        try {
          const email = user.email.toLowerCase().trim();
          // Check if the user exists in our neon database users table (case-insensitive)
          const existingUsers = await sql`SELECT * FROM users WHERE LOWER(email) = ${email}`;
          if (existingUsers.length > 0 && existingUsers[0].is_blocked) {
            // Reject sign in for blocked users
            return false;
          }
          if (account?.provider === "google") {
            const googleSub = profile?.sub || (user as any).id || null;
            if (existingUsers.length === 0) {
              // User doesn't exist, insert them!
              const fullName = user.name || 'Google User';
              const adminEmails = [
                'admin@earnbyapps.com',
                'mayank.gupta.dev.1@gmail.com',
                'aashish.gupta.mails@gmail.com'
              ];
              const role = adminEmails.includes(email) ? 'admin' : 'user';
              
              const newId = crypto.randomUUID();
              await sql`
                INSERT INTO users (id, email, full_name, role, balance, google_sub)
                VALUES (${newId}, ${email}, ${fullName}, ${role}, 0.00, ${googleSub})
              `;
              console.log(`Successfully registered new user via Google: ${email}`);
            } else if (googleSub && !existingUsers[0].google_sub) {
              // Existing user signing in with Google - attach google_sub
              try {
                await sql`UPDATE users SET google_sub = ${googleSub} WHERE id = ${existingUsers[0].id}`;
              } catch (updateErr) {
                console.warn("Could not update google_sub:", updateErr);
              }
            }
          }
        } catch (err) {
          console.error("Error saving user to database during Google Sign In:", err);
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }: { token: any; user?: any; account?: any; profile?: any }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.balance = (user as any).balance;
      }
      // If user signed in via Google or token id is not set, resolve from DB
      if (token.email && (!token.id || !token.role) && isDbConfigured) {
        try {
          const email = token.email.toLowerCase().trim();
          const dbUsers = await sql`SELECT id, role, balance FROM users WHERE LOWER(email) = ${email} LIMIT 1`;
          if (dbUsers.length > 0) {
            token.id = String(dbUsers[0].id);
            token.role = dbUsers[0].role;
            token.balance = Number(dbUsers[0].balance || 0);
          }
        } catch (dbErr) {
          console.error("Error retrieving user in jwt callback:", dbErr);
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        const email = session.user.email ? session.user.email.toLowerCase().trim() : '';
        const adminEmails = [
          'admin@earnbyapps.com',
          'mayank.gupta.dev.1@gmail.com',
          'aashish.gupta.mails@gmail.com'
        ];
        const isAdmin = adminEmails.includes(email);

        if (isDbConfigured && email) {
          try {
            const dbUsers = await sql`SELECT id, role, balance FROM users WHERE LOWER(email) = ${email} LIMIT 1`;
            if (dbUsers.length > 0) {
              (session.user as any).id = String(dbUsers[0].id);
              (session.user as any).role = dbUsers[0].role;
              (session.user as any).balance = Number(dbUsers[0].balance || 0);
            } else {
              (session.user as any).id = token.id || token.sub;
              (session.user as any).role = token.role || (isAdmin ? 'admin' : 'user');
              (session.user as any).balance = token.balance || 0;
            }
          } catch (err) {
            console.error("Error retrieving user session role from database:", err);
            (session.user as any).id = token.id || token.sub;
            (session.user as any).role = token.role || (isAdmin ? 'admin' : 'user');
            (session.user as any).balance = token.balance || 0;
          }
        } else {
          (session.user as any).id = token.id || token.sub;
          (session.user as any).role = token.role || (isAdmin ? 'admin' : 'user');
          (session.user as any).balance = token.balance || 0;
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
