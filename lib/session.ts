import 'server-only';
import { headers } from 'next/headers';
import { auth } from './auth';

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error('UNAUTHENTICATED');
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return user;
}
