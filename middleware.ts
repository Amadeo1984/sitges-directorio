import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Skip Next internals, api, static files, sitemap, robots, favicon
    '/((?!api|_next|_vercel|.*\\..*|sitemap.xml|robots.txt).*)',
  ],
};
