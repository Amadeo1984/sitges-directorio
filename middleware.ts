import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { findStaticRedirect } from './lib/redirects';

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1) Redirects legacy del WordPress antiguo (slug en raíz sin locale)
  const redirect = findStaticRedirect(pathname);
  if (redirect) {
    const url = new URL(redirect.to + search, req.url);
    return NextResponse.redirect(url, redirect.code);
  }

  // 2) Resto: delega al middleware i18n
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*|sitemap.xml|robots.txt).*)',
  ],
};
