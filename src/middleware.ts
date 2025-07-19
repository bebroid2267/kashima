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
  
  
  // Стандартная проверка PWA для обычных пользователей
  
  // Доверенные индикаторы PWA режима (заголовки браузера)
  const isRealPWA = 
    request.headers.get('display-mode') === 'standalone' || 
    request.headers.has('app-platform');
  
  // Вторичные индикаторы (могут быть подделаны)
  const hasPwaCookie = request.cookies.has('isPwa');
  const hasRealerPwaCookie = request.cookies.has('realer-pwa'); // Новая кука, установленная только в PWA
  const hasPwaParam = url.searchParams.has('pwa');
  
  // ВАЖНО: Определение PWA более гибкое
  // Если это РЕАЛЬНОЕ PWA (через заголовки), то устанавливаем особую куку
  let response = NextResponse.next();
  
  if (isRealPWA) {
    // Устанавливаем cookie, которая будет доступна только в настоящем PWA
    response.cookies.set('realer-pwa', 'true', { 
      path: '/',
      maxAge: 31536000,
      sameSite: 'strict'
    });
  }
  
  // Считаем PWA если:
  // 1. Реальный PWA (индикаторы браузера) 
  // ИЛИ
  // 2. Есть наша специальная кука realer-pwa или обычная isPwa И параметр pwa=true
  const isPWA = isRealPWA || hasRealerPwaCookie || (hasPwaCookie && hasPwaParam);
  
  // Логируем информацию о проверке PWA статуса
  console.log(`[Middleware] Path: ${pathname}, isPWA: ${isPWA}, isRealPWA: ${isRealPWA}`);
  console.log(`[Middleware] Headers:`, {
    displayMode: request.headers.get('display-mode'),
    appPlatform: request.headers.has('app-platform'),
    hasPwaCookie,
    hasRealerPwaCookie,
    hasPwaParam,
    userAgent: request.headers.get('user-agent')
  });

  // ПРАВИЛО 1: Если пользователь в PWA и пытается зайти на страницу download
  if (isPWA && pathname === '/download') {
    // Перенаправляем на страницу auth с флагом pwa=true
    console.log('[Middleware] PWA user redirected from download to auth');
    url.pathname = '/auth';
    url.searchParams.set('pwa', 'true');
    const redirectResponse = NextResponse.redirect(url);
    
    // Копируем куку realer-pwa в ответ редиректа, если она была
    if (isRealPWA || hasRealerPwaCookie) {
      redirectResponse.cookies.set('realer-pwa', 'true', { 
        path: '/',
        maxAge: 31536000,
        sameSite: 'strict'
      });
    }
    
    return redirectResponse;
  }
  
  // ПРАВИЛО 2: Если пользователь НЕ в PWA и пытается зайти на любую страницу, кроме download
  if (!isPWA && pathname !== '/download') {
    // Перенаправляем на страницу download
    console.log(`[Middleware] Non-PWA user redirected to download from: ${pathname}`);
    url.pathname = '/download';
    return NextResponse.redirect(url);
  }
  
  // Если пользователь в PWA, добавляем параметр pwa=true к URL
  if (isPWA && !url.searchParams.has('pwa')) {
    url.searchParams.set('pwa', 'true');
    // Возвращаем переписанный URL с параметром pwa
    response = NextResponse.rewrite(url);
    
    // Копируем куку realer-pwa в ответ редиректа, если она была
    if (isRealPWA || hasRealerPwaCookie) {
      response.cookies.set('realer-pwa', 'true', { 
        path: '/',
        maxAge: 31536000,
        sameSite: 'strict'
      });
    }
  }
  
  // Возвращаем ответ
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