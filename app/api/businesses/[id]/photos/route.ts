import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/session';
import { db } from '@/lib/db';
import { deleteObject } from '@/lib/storage';

const CreateSchema = z.object({
  key: z.string().min(1),
  url: z.string().url(),
  alt: z.string().max(200).optional(),
});

async function checkOwner(businessId: string) {
  const session = await getServerSession();
  if (!session?.user) return { error: NextResponse.json({ error: 'unauthenticated' }, { status: 401 }), session: null };
  const biz = await db.business.findUnique({ where: { id: businessId }, select: { ownerId: true } });
  if (!biz) return { error: NextResponse.json({ error: 'not_found' }, { status: 404 }), session };
  if (biz.ownerId !== session.user.id && session.user.role !== 'ADMIN')
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }), session };
  return { error: null, session };
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const check = await checkOwner(id);
  if (check.error) return check.error;

  const parsed = CreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const last = await db.media.findFirst({ where: { businessId: id }, orderBy: { position: 'desc' } });
  const count = await db.media.count({ where: { businessId: id } });

  const created = await db.media.create({
    data: {
      businessId: id,
      key: parsed.data.key,
      url: parsed.data.url,
      alt: parsed.data.alt ?? null,
      position: (last?.position ?? -1) + 1,
      isPrimary: count === 0, // primera foto = portada por defecto
    },
  });
  return NextResponse.json({ media: created });
}

const UpdateSchema = z.object({
  mediaId: z.string().min(1),
  isPrimary: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
  alt: z.string().max(200).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const check = await checkOwner(id);
  if (check.error) return check.error;

  const parsed = UpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const media = await db.media.findUnique({ where: { id: parsed.data.mediaId }, select: { businessId: true } });
  if (!media || media.businessId !== id) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  if (parsed.data.isPrimary === true) {
    // resetea otros y deja este como primario
    await db.$transaction([
      db.media.updateMany({ where: { businessId: id, isPrimary: true }, data: { isPrimary: false } }),
      db.media.update({ where: { id: parsed.data.mediaId }, data: { isPrimary: true } }),
    ]);
  }
  if (parsed.data.position !== undefined || parsed.data.alt !== undefined) {
    await db.media.update({
      where: { id: parsed.data.mediaId },
      data: { position: parsed.data.position, alt: parsed.data.alt },
    });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const check = await checkOwner(id);
  if (check.error) return check.error;

  const url = new URL(req.url);
  const mediaId = url.searchParams.get('mediaId');
  if (!mediaId) return NextResponse.json({ error: 'missing mediaId' }, { status: 400 });

  const media = await db.media.findUnique({ where: { id: mediaId } });
  if (!media || media.businessId !== id) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  try {
    await deleteObject(media.key);
  } catch {
    // si falla el delete remoto, seguimos borrando la fila para no dejar zombies en UI
  }
  await db.media.delete({ where: { id: mediaId } });
  return NextResponse.json({ ok: true });
}
