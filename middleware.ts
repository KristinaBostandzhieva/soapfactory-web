import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, SESSION_COOKIE } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;

  // Admin area — must be logged in AND an admin
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const url = new URL('/vhod', req.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== 'admin') return NextResponse.redirect(new URL('/', req.url));
  }

  // Account area — must be logged in
  if (pathname.startsWith('/account')) {
    if (!session) {
      const url = new URL('/vhod', req.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
