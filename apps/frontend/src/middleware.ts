import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only protect /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('access_token')?.value;
    const isLoginPage = pathname === '/admin/login';

    if (!token && !isLoginPage) {
      // Not logged in and trying to access protected route -> redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    if (token && isLoginPage) {
      // Logged in and trying to access login page -> redirect to dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
