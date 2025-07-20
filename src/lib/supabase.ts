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
      from: (table: string) => {
        const mockResponse = { data: null, error: { message: 'Database connection error' } };
        return {
          select: (columns?: string) => {
            // Если это простой select без дальнейших методов
            const selectResult = {
              ...mockResponse,
              single: async () => mockResponse,
              maybeSingle: async () => mockResponse,
              eq: () => ({
                single: async () => mockResponse,
                maybeSingle: async () => mockResponse
              })
            };
            return selectResult;
          },
          update: () => ({
            eq: () => ({
              ...mockResponse,
              select: () => ({
                single: async () => ({ data: null, error: { message: 'Database connection error' } })
              })
            })
          }),
          upsert: async () => ({ data: null, error: { message: 'Database connection error' } }),
          insert: async () => ({ data: null, error: { message: 'Database connection error' } })
        };
      }
    };
  }
};

// Create a single supabase client for interacting with your database
export const supabase = createSafeSupabaseClient();