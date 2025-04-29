import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Мы больше не используем Supabase Auth, поэтому просто пропускаем все запросы
  // Аутентификация теперь обрабатывается на клиентской стороне с помощью localStorage
  return NextResponse.next();
}

// Обновляем matcher, чтобы он не перехватывал никакие запросы
export const config = {
  matcher: [],
}; 