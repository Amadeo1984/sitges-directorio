import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/session';
import { db } from '@/lib/db';
import { sendClaimRequestEmail } from '@/lib/email';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@sitges.pro';

const Schema = z.object({ message: z.string().max(2000).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const parsed = Schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const biz = await db.business.findUnique({
    where: { id },
    include: { translations: { where: { locale: 'es' } } },
  });
  if (!biz) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (biz.ownerId) return NextResponse.json({ error: 'already_owned' }, { status: 409 });

  const tr = biz.translations[0];
  await sendClaimRequestEmail({
    adminTo: adminEmail,
    businessName: tr?.name ?? id,
    businessUrl: tr ? `${appUrl}/es/n/${tr.slug}` : `${appUrl}/es`,
    claimantEmail: session.user.email,
    claimantName: session.user.name ?? undefined,
    message: parsed.data.message,
  });
  return NextResponse.json({ ok: true });
}
