import { NextResponse } from 'next/server';
import { sql, isDbConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shouldPingDb = searchParams.get('db') === 'true';

  // By default, return healthy status WITHOUT querying Neon to let Neon scale to zero and save compute hours
  if (!shouldPingDb) {
    return NextResponse.json({
      status: 'ok',
      service: 'earnbyapps-api',
      mode: isDbConfigured ? 'database-configured' : 'fallback',
      dbPing: 'disabled_to_save_compute',
      timestamp: new Date().toISOString()
    });
  }

  if (!isDbConfigured) {
    return NextResponse.json({ status: 'ok', mode: 'fallback' });
  }

  const start = performance.now();
  try {
    // Explicit ping requested
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
