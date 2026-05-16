import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getServerSession } from '@/lib/session';
import { db } from '@/lib/db';
import { getUploadUrl, publicUrlFor } from '@/lib/storage';

const Schema = z.object({
  businessId: z.string().min(1),
  filename: z.string().min(1).max(200),
  contentType: z.string().regex(/^image\/(jpeg|png|webp|avif)$/),
  size: z.number().int().min(1).max(10 * 1024 * 1024), // máx 10 MB
});

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const json = await req.json();
  const parsed = Schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const biz = await db.business.findUnique({
    where: { id: parsed.data.businessId },
    select: { ownerId: true },
  });
  if (!biz) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (biz.ownerId !== session.user.id && session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const ext = parsed.data.contentType.split('/')[1];
  const key = `businesses/${parsed.data.businessId}/${randomUUID()}.${ext}`;
  const uploadUrl = await getUploadUrl({ key, contentType: parsed.data.contentType });

  return NextResponse.json({
    uploadUrl,
    key,
    publicUrl: publicUrlFor(key),
  });
}
