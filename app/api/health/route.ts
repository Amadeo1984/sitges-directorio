import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Health check para Dokploy/Traefik:
 * - 200 si la app está viva y puede leer la BD
 * - 503 si la BD falla
 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'db_error' },
      { status: 503 },
    );
  }
}
