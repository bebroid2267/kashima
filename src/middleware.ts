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
  
  // Определяем окончательный статус PWA
  // Для строгой безопасности, учитываем вторичные индикаторы только если хотя бы одно из условий ниже:
  // 1. Это страница download (где мы хотим, чтобы PWA пользователи могли перейти в auth)
  // 2. Уже есть основной индикатор PWA
  const shouldConsiderSecondaryIndicators = pathname === '/download' || isRealPWA;
  
  const isPWA = isRealPWA || (shouldConsiderSecondaryIndicators && (hasPwaCookie || hasPwaParam));
  
  // Логируем информацию о проверке PWA статуса
  console.log(`[Middleware] Path: ${pathname}, isPWA: ${isPWA}, isRealPWA: ${isRealPWA}`);
  console.log(`[Middleware] Headers:`, {
    displayMode: request.headers.get('display-mode'),
    appPlatform: request.headers.has('app-platform'),
    hasPwaCookie,
    hasPwaParam
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