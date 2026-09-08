import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql, isDbConfigured } from "../../../../lib/db";
import crypto from "crypto";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        token: { label: "Token", type: "text" }
      },
      async authorize(credentials) {
        if (!isDbConfigured) {
          throw new Error("DATABASE_URL is not configured.");
        }

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
  secret: process.env.NEXTAUTH_SECRET || "earnbyapps-nextauth-secret-key-12345",
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      if (user && user.email && isDbConfigured) {
        try {
          // Check if the user exists in our neon database users table
          const existingUsers = await sql`SELECT * FROM users WHERE email = ${user.email}`;
          if (existingUsers.length > 0 && existingUsers[0].is_blocked) {
            // Reject sign in for blocked users
            return false;
          }
          if (account?.provider === "google" && existingUsers.length === 0) {
            // User doesn't exist, insert them!
            const fullName = user.name || 'Google User';
            const role = user.email === 'admin@earnbyapps.com' || user.email === 'mayank.gupta.dev.1@gmail.com' || user.email === 'aashish.gupta.mails@gmail.com' ? 'admin' : 'user';
            
            const newId = crypto.randomUUID();
            await sql`
              INSERT INTO users (id, email, full_name, role, balance)
              VALUES (${newId}, ${user.email}, ${fullName}, ${role}, 0.00)
            `;
            console.log(`Successfully registered new user via Google: ${user.email}`);
          }
        } catch (err) {
          console.error("Error saving user to database during Google Sign In:", err);
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = (user as any).role;
        token.balance = (user as any).balance;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        if (isDbConfigured) {
          try {
            const dbUsers = await sql`SELECT role, balance FROM users WHERE email = ${session.user.email}`;
            if (dbUsers.length > 0) {
              (session.user as any).role = dbUsers[0].role;
              (session.user as any).balance = Number(dbUsers[0].balance);
            } else {
              const isAdmin = session.user.email === 'admin@earnbyapps.com' || session.user.email === 'mayank.gupta.dev.1@gmail.com' || session.user.email === 'aashish.gupta.mails@gmail.com';
              (session.user as any).role = token.role || (isAdmin ? 'admin' : 'user');
              (session.user as any).balance = token.balance || 0;
            }
          } catch (err) {
            console.error("Error retrieving user session role from database:", err);
            const isAdmin = session.user.email === 'admin@earnbyapps.com' || session.user.email === 'mayank.gupta.dev.1@gmail.com' || session.user.email === 'aashish.gupta.mails@gmail.com';
            (session.user as any).role = token.role || (isAdmin ? 'admin' : 'user');
            (session.user as any).balance = token.balance || 0;
          }
        } else {
          const isAdmin = session.user.email === 'admin@earnbyapps.com' || session.user.email === 'mayank.gupta.dev.1@gmail.com' || session.user.email === 'aashish.gupta.mails@gmail.com';
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
