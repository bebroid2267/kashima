import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get current URL path
  const url = request.nextUrl.clone();
  const { pathname } = url;
  
  // Разрешить доступ к ресурсам и API независимо от статуса PWA
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('.') || 
    pathname === '/sw.js' || 
    pathname.startsWith('/workbox-') ||
    pathname === '/manifest.json' || 
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/screenshots/')
  ) {
    return NextResponse.next();
  }
  
  // Проверка PWA статуса по нескольким признакам
  const isPWA = 
    request.headers.get('display-mode') === 'standalone' || 
    request.headers.has('app-platform') ||  // Некоторые браузеры могут устанавливать этот заголовок
    request.cookies.has('isPwa') ||  // Проверка cookie
    url.searchParams.has('pwa');  // URL параметр как запасной вариант
  
  // Логируем информацию о проверке PWA статуса
  console.log(`[Middleware] Path: ${pathname}, isPWA: ${isPWA}`);
  console.log(`[Middleware] Headers:`, {
    displayMode: request.headers.get('display-mode'),
    appPlatform: request.headers.has('app-platform'),
    hasPwaCookie: request.cookies.has('isPwa'),
    hasPwaParam: url.searchParams.has('pwa')
  });

  // ПРАВИЛО 1: Если пользователь в PWA и пытается зайти на страницу download
  if (isPWA && pathname === '/download') {
    // Перенаправляем на страницу auth
    console.log('[Middleware] PWA пользователь перенаправлен с download на auth');
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  // ПРАВИЛО 2: Если пользователь НЕ в PWA и пытается зайти на любую страницу, кроме download
  if (!isPWA && pathname !== '/download') {
    // Перенаправляем на страницу download
    console.log(`[Middleware] НЕ-PWA пользователь перенаправлен на download с: ${pathname}`);
    return NextResponse.redirect(new URL('/download', request.url));
  }
  
  // Для всех остальных случаев разрешаем доступ
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