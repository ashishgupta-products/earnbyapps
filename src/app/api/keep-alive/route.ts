import { NextResponse } from 'next/server';
import { sql, isDbConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isDbConfigured) {
    return NextResponse.json({ status: 'ok', mode: 'fallback' });
  }

  const start = performance.now();
  try {
    // Lightest possible query to keep Neon compute container warm
    await sql`SELECT 1 as ping`;
    const latency = Math.round(performance.now() - start);

    return NextResponse.json({
      status: 'warm',
      latencyMs: latency,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
