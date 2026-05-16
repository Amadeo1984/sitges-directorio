import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getSessionCookie } from 'better-auth/cookies';
import { routing } from './i18n/routing';
import { locales } from './i18n/config';
import { findStaticRedirect } from './lib/redirects';

const intlMiddleware = createMiddleware(routing);

const DASHBOARD_RE = new RegExp(`^/(${locales.join('|')})/dashboard(?:/.*)?$`);

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1) Redirects legacy del WordPress antiguo (slug en raíz sin locale)
  const redirect = findStaticRedirect(pathname);
  if (redirect) {
    const url = new URL(redirect.to + search, req.url);
    return NextResponse.redirect(url, redirect.code);
  }

  // 2) Auth gate: /[locale]/dashboard requiere sesión
  if (DASHBOARD_RE.test(pathname)) {
    const sessionCookie = getSessionCookie(req);
    if (!sessionCookie) {
      const localeMatch = pathname.match(/^\/([a-z]{2})\//);
      const loc = localeMatch?.[1] ?? routing.defaultLocale;
      const url = new URL(`/${loc}/login`, req.url);
      url.searchParams.set('next', pathname + search);
      return NextResponse.redirect(url);
    }
  }

  // 3) Resto: delega al middleware i18n
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*|sitemap.xml|robots.txt).*)',
  ],
};
