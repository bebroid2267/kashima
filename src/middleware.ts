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
  
  // Доверенные индикаторы PWA режима (заголовки браузера)
  const isRealPWA = 
    request.headers.get('display-mode') === 'standalone' || 
    request.headers.has('app-platform');
  
  // Вторичные индикаторы (могут быть подделаны)
  const hasPwaCookie = request.cookies.has('isPwa');
  const hasPwaParam = url.searchParams.has('pwa');
  
  // ВАЖНО: Делаем определение PWA более гибким
  // Считаем PWA если есть любой из следующих признаков:
  // 1. Реальный PWA (индикаторы браузера)
  // 2. Есть кука isPwa (установленная ранее)
  // 3. Есть параметр URL pwa=true (используется при редиректе)
  const isPWA = isRealPWA || hasPwaCookie || hasPwaParam;
  
  // Логируем информацию о проверке PWA статуса
  console.log(`[Middleware] Path: ${pathname}, isPWA: ${isPWA}, isRealPWA: ${isRealPWA}`);
  console.log(`[Middleware] Headers:`, {
    displayMode: request.headers.get('display-mode'),
    appPlatform: request.headers.has('app-platform'),
    hasPwaCookie,
    hasPwaParam,
    userAgent: request.headers.get('user-agent')
  });

  // ПРАВИЛО 1: Если пользователь в PWA и пытается зайти на страницу download
  if (isPWA && pathname === '/download') {
    // Перенаправляем на страницу auth с флагом pwa=true
    console.log('[Middleware] PWA пользователь перенаправлен с download на auth');
    url.pathname = '/auth';
    url.searchParams.set('pwa', 'true');
    return NextResponse.redirect(url);
  }
  
  // ПРАВИЛО 2: Если пользователь НЕ в PWA и пытается зайти на любую страницу, кроме download
  if (!isPWA && pathname !== '/download') {
    // Перенаправляем на страницу download
    console.log(`[Middleware] НЕ-PWA пользователь перенаправлен на download с: ${pathname}`);
    url.pathname = '/download';
    return NextResponse.redirect(url);
  }
  
  // Если пользователь в PWA, добавляем параметр pwa=true к URL
  if (isPWA && !url.searchParams.has('pwa')) {
    url.searchParams.set('pwa', 'true');
    // Возвращаем переписанный URL с параметром pwa
    return NextResponse.rewrite(url);
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