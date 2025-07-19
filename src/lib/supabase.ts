import { createBrowserClient } from '@supabase/ssr';

// Безопасное получение переменных окружения с дефолтными значениями для разработки
// В продакшене необходимо задать эти значения через соответствующий метод (например, в настройках хостинга)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Проверка наличия необходимых переменных окружения
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

// Создаем обертку для клиента Supabase с обработкой ошибок
const createSafeSupabaseClient = () => {
  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    
    // Возвращаем заглушку клиента, которая не вызовет ошибок при вызове методов
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: { message: 'Database connection error' } }),
            single: async () => ({ data: null, error: { message: 'Database connection error' } })
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: null, error: { message: 'Database connection error' } })
            })
          })
        })
      })
    };
  }
};

// Create a single supabase client for interacting with your database
export const supabase = createSafeSupabaseClient(); 