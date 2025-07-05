import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

// Define excluded API routes that shouldn't be logged
const EXCLUDED_API_ROUTES = [
  '/api/admin/system/log',
  '/api/admin/system/status'
];

export async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request });
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isExcludedApiRoute = EXCLUDED_API_ROUTES.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Additional check to exclude stats requests
  const isStatsRequest = request.nextUrl.pathname === '/api/admin/system/log' &&
    request.nextUrl.searchParams.get('stats') === 'true';

  // Handle admin routes
  if (isAdminRoute) {
    if (!token?.isAdmin) {
      const url = new URL('/', request.url);
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  // Handle auth routes
  if (isAuthRoute) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Log API requests (excluding specific routes and stats requests)
  if (isApiRoute && !isExcludedApiRoute && !isStatsRequest) {
    const startTime = Date.now();
    const response = await NextResponse.next();
    const responseTime = Date.now() - startTime;

    // Don't consume the response body - just log basic error info
    let errorMessage = null;
    if (response.status >= 400) {
      errorMessage = `HTTP ${response.status} Error`;
    }

    // Log the request asynchronously
    fetch(`${request.nextUrl.origin}/api/admin/system/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: request.nextUrl.pathname,
        method: request.method,
        status: response.status,
        responseTime,
        userId: token?.sub || null,
        userAgent: request.headers.get('user-agent') || null,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        error: errorMessage
      })
    }).catch(error => {
      console.error('Failed to log API request:', error);
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*', '/api/:path*'],
};