import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/auth/session';
import { SessionData } from '@/lib/auth/types';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to auth API routes, health check, and image serving
  if (pathname.startsWith('/api/auth') || pathname === '/api/health' || pathname.startsWith('/api/images')) {
    return NextResponse.next();
  }

  // Get session
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );

  const isLoggedIn = session.isLoggedIn;

  // Redirect to login if not authenticated and trying to access protected routes
  if (!isLoggedIn && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to planner if authenticated and trying to access login
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/planner', request.url));
  }

  // Redirect root to login if not authenticated (dashboard is now the landing page)
  if (pathname === '/' && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
