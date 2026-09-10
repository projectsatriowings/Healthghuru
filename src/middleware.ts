/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth.config';

export default auth((req: NextRequest & { auth: any }) => {
  const { nextUrl } = req;
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
  matcher: ['/admin/:path*'],
};
