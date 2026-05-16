// Mapa de redirects WP→nuevo, generado en build a partir del archivo de seed.
// Mantenido en sincronía manual con prisma/seed-data/redirects.ts; el seed lo
// graba también en BD para que el panel admin pueda editarlos en runtime,
// pero el middleware usa este mapa estático (cero latencia, sin queries).
import { REDIRECTS } from '@/prisma/seed-data/redirects';

const map = new Map<string, { to: string; code: number }>();
for (const r of REDIRECTS) {
  map.set(normalize(r.from), { to: r.to, code: r.code ?? 301 });
}

function normalize(p: string): string {
  if (p.endsWith('/') && p.length > 1) return p.slice(0, -1);
  return p;
}

export function findStaticRedirect(pathname: string): { to: string; code: number } | null {
  return map.get(normalize(pathname)) ?? null;
}
