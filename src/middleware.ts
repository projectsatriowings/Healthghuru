/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth.config';

export default auth((req: NextRequest & { auth: any }) => {
  const { nextUrl } = req;
  const host = req.headers.get('host') || nextUrl.host;
  const proto = req.headers.get('x-forwarded-proto');

  // 1. Canonicalization: 301 Permanent Redirect www -> apex (healthghuru.com)
  if (host && host.startsWith('www.')) {
    const canonicalHost = host.replace(/^www\./, '');
    const canonicalUrl = new URL(nextUrl.pathname + nextUrl.search, `https://${canonicalHost}`);
    return NextResponse.redirect(canonicalUrl, 301);
  }

  // 2. Canonicalization: 301 Permanent Redirect http -> https (in production)
  if (proto === 'http' && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const canonicalUrl = new URL(nextUrl.pathname + nextUrl.search, `https://${host}`);
    return NextResponse.redirect(canonicalUrl, 301);
  }

  // 3. Admin Authentication Guard
  const isAdminRoute = nextUrl.pathname.startsWith('/admin') && nextUrl.pathname !== '/admin/login';
  const session = (req as any).auth;

  if (isAdminRoute) {
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - images, uploads (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|uploads).*)',
  ],
};
