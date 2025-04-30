import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Add TypeScript declarations for window properties
declare global {
  interface Window {
    supabaseInitError?: string;
    supabase?: SupabaseClient;
  }
}

// These environment variables need to be set in your .env.local file
const supabaseUrl = 'https://ovjcvdefiytsreizmnjh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92amN2ZGVmaXl0c3JlaXptbmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NDY2NzksImV4cCI6MjA2MTMyMjY3OX0.ZprtbAF6yZZTQosh88Xq1AqXWKTLkJekzazURIEjoYM';

// Debug log environment variables (sanitized for security)
console.log('Supabase URL available:', !!supabaseUrl);
console.log('Supabase Anon Key available:', !!supabaseAnonKey);

// Create a single supabase client for interacting with your database
let supabase: SupabaseClient | undefined = undefined;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials. Check environment variables.');
    // For development fallback
    if (typeof window !== 'undefined') {
      window.supabaseInitError = 'Missing Supabase credentials';
    }
  } else {
    supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
    if (typeof window !== 'undefined') {
      window.supabase = supabase; // Make it available globally for debugging
    }
  }
} catch (error: unknown) {
  console.error('Error initializing Supabase client:', error);
  if (typeof window !== 'undefined') {
    window.supabaseInitError = error instanceof Error ? error.message : String(error);
  }
}

export { supabase }; 