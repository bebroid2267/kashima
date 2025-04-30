import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Add TypeScript declarations for window properties
declare global {
  interface Window {
    supabaseInitError?: string;
    supabase?: SupabaseClient;
  }
}

console.log('SUPABASE INIT: Starting initialization'); 

// These environment variables need to be set in your .env.local file
const supabaseUrl = 'https://ovjcvdefiytsreizmnjh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92amN2ZGVmaXl0c3JlaXptbmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NDY2NzksImV4cCI6MjA2MTMyMjY3OX0.ZprtbAF6yZZTQosh88Xq1AqXWKTLkJekzazURIEjoYM';

// Debug log environment variables (sanitized for security)
console.log('SUPABASE INIT: URL available:', !!supabaseUrl);
console.log('SUPABASE INIT: Anon Key available:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('SUPABASE INIT: Missing environment variables!');
}

// Create a single supabase client for interacting with your database
let supabase: SupabaseClient | undefined = undefined;

try {
  console.log('SUPABASE INIT: Attempting to create client');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('SUPABASE INIT: Missing Supabase credentials. Check environment variables.');
    // For development fallback
    if (typeof window !== 'undefined') {
      console.log('SUPABASE INIT: Setting window.supabaseInitError');
      window.supabaseInitError = 'Missing Supabase credentials';
    }
  } else {
    console.log('SUPABASE INIT: Creating browser client with credentials');
    supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
    
    if (typeof window !== 'undefined') {
      console.log('SUPABASE INIT: Making client available globally via window.supabase');
      window.supabase = supabase; // Make it available globally for debugging
    }
    
    console.log('SUPABASE INIT: Client created successfully:', !!supabase);
  }
} catch (error: unknown) {
  console.error('SUPABASE INIT: Error initializing Supabase client:', error);
  if (typeof window !== 'undefined') {
    console.log('SUPABASE INIT: Setting window.supabaseInitError with error message');
    window.supabaseInitError = error instanceof Error ? error.message : String(error);
  }
}

// Add some verification logs
if (supabase) {
  console.log('SUPABASE INIT: Client initialized and ready to use');
} else {
  console.error('SUPABASE INIT: Failed to initialize client');
}

export { supabase }; 