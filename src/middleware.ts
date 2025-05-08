import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get current URL path
  const url = request.nextUrl.clone();
  const { pathname } = url;
  
  // Allow access to assets and API routes regardless of PWA status
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('.') || 
    pathname === '/download' || 
    pathname === '/sw.js' || 
    pathname.startsWith('/workbox-')
  ) {
    return NextResponse.next();
  }
  
  // Check if the user is accessing from a standalone PWA app using multiple methods
  const isStandalone = 
    request.headers.get('display-mode') === 'standalone' || 
    request.headers.has('app-platform') ||  // Custom header some browsers may set
    request.cookies.has('isPwa');  // Use cookie for more persistent detection
  
  // If user is not in standalone mode and trying to access any route other than download
  if (!isStandalone && pathname !== '/download') {
    // Redirect to download page
    console.log('Middleware: Non-PWA user redirected to download page from:', pathname);
    url.pathname = '/download';
    return NextResponse.redirect(url);
  }
  
  // If user is in standalone PWA mode and trying to access the download page
  if (isStandalone && pathname === '/download') {
    // Redirect to auth page
    console.log('Middleware: PWA user redirected from download page to auth');
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
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