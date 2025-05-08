import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get current URL path
  const url = request.nextUrl.clone();
  const { pathname } = url;
  
  // Always allow direct access to the download page
  // This way PWA detection can happen on the client side
  if (pathname === '/download') {
    return NextResponse.next();
  }
  
  // Allow access to assets and API routes regardless of PWA status
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('.') || 
    pathname === '/sw.js' || 
    pathname.startsWith('/workbox-')
  ) {
    return NextResponse.next();
  }
  
  // Check if PWA mode is indicated by any of:
  // 1. Headers
  // 2. Cookies
  // 3. URL parameters
  const isStandalone = 
    request.headers.get('display-mode') === 'standalone' || 
    request.headers.has('app-platform') ||  // Custom header some browsers may set
    request.cookies.has('isPwa') ||  // Cookie-based detection
    url.searchParams.has('pwa');  // URL parameter fallback
  
  // Debug information in headers for troubleshooting
  const response = isStandalone 
    ? NextResponse.next()
    : NextResponse.redirect(new URL('/download', request.url));
    
  // Add debug info to response headers (visible in Network tab)
  response.headers.set('X-PWA-Check', String(isStandalone));
  response.headers.set('X-PWA-Cookies', String(request.cookies.has('isPwa')));
  response.headers.set('X-PWA-Headers', String(request.headers.get('display-mode') === 'standalone'));
  
  // If not in PWA mode and trying to access any route other than download,
  // redirect to download page
  if (!isStandalone && pathname !== '/download') {
    console.log('Middleware: Non-PWA user redirected to download page from:', pathname);
    return response;
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 