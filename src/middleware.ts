import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

// Define excluded API routes that shouldn't be logged
const EXCLUDED_API_ROUTES = [
  '/api/admin/',
  '/api/analytics/',
];

// Define protected paths that require authentication
const PROTECTED_PATHS = [
  '/booking/',
  '/accounts/',
  '/messages/',
  '/notification/',
  '/dashboard/'
];

export async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request });
  const pathname = request.nextUrl.pathname;

  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/auth');
  const isApiRoute = pathname.startsWith('/api');
  const isExcludedApiRoute = EXCLUDED_API_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  // Check if current path is a protected route
  const isProtectedPath = PROTECTED_PATHS.some(path => {
    if (path.endsWith('/')) {
      // For paths ending with /, match the path and any subpaths
      return pathname.startsWith(path) || pathname === path.slice(0, -1);
    }
    return pathname.startsWith(path);
  });

  // Additional check to exclude stats requests
  const isStatsRequest = pathname === '/api/admin/system/log' &&
    request.nextUrl.searchParams.get('stats') === 'true';

  // Handle protected paths - require authentication
  if (isProtectedPath) {
    if (!token) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

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
        path: pathname,
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
  matcher: [
    '/admin/:path*',
    '/auth/:path*',
    '/api/:path*',
    '/booking/:path*',
    '/accounts/:path*',
    '/messages/:path*',
    '/notifications/:path*',
    '/dashboard/:path*'
  ],
};