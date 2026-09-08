import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Ensure the connection string is defined
const connectionString = process.env.DATABASE_URL;

export const isDbConfigured = Boolean(connectionString && connectionString.trim().length > 0);

if (!isDbConfigured) {
  console.warn("WARNING: DATABASE_URL is not set. Database queries will fail.");
}

const client = isDbConfigured ? neon(connectionString!) : null;

// Export resilient Neon SQL query runner so importing db.ts never throws on startup
export const sql: NeonQueryFunction<false, false> = new Proxy(
  ((...args: any[]) => {
    if (!client) {
      throw new Error("DATABASE_URL is not configured. Please set DATABASE_URL environment variable.");
    }
    return (client as any)(...args);
  }) as any,
  {
    get(target, prop, receiver) {
      if (client && prop in client) {
        return (client as any)[prop];
      }
      return Reflect.get(target, prop, receiver);
    }
  }
);
