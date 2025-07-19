'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// Ensure we handle null/undefined supabase client
const supabaseClient = supabase as SupabaseClient | undefined;

export default function AuthPage() {
  const [mbId, setMbId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const router = useRouter();

  // Проверяем, что пользователь находится в PWA режиме
  useEffect(() => {
    const checkPWAStatus = () => {
      if (typeof window === 'undefined') return;
      
      // Проверка DEV режима - если есть параметр dev=true, пропускаем все проверки
      const isDevMode = window.location.href.includes('dev=true');
      if (isDevMode) {
        console.log('AUTH PAGE: DEV MODE activated, skipping PWA checks');
        
        // В dev режиме сразу устанавливаем все необходимые флаги
        localStorage.setItem('isPwa', 'true');
        sessionStorage.setItem('isPwa', 'true');
        document.cookie = 'isPwa=true; path=/; max-age=31536000; SameSite=Strict';
        document.cookie = 'realer-pwa=true; path=/; max-age=31536000; SameSite=Strict';
        
        // И возвращаем true, чтобы не выполнять редирект на страницу download
        return true;
      }
      
      // Функция для определения PWA режима
      const getPWADisplayMode = () => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (document.referrer.startsWith('android-app://')) {
          return 'twa';
        } else if ((window.navigator as any).standalone || isStandalone) {
          return 'standalone';
        }
        return 'browser';
      };
      
      // Проверяем специальную куку, устанавливаемую только в реальном PWA
      function getCookie(name: string): string | null {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      }
      
      // Проверка специальной куки realer-pwa
      const hasRealerPwaCookie = getCookie('realer-pwa') === 'true';
      
      const displayMode = getPWADisplayMode();
      
      // Прежде всего проверяем настоящие признаки PWA
      const isRealPWA = displayMode !== 'browser';
      
      // Вторичные индикаторы
      const storedPwaStatus = localStorage.getItem('isPwa') === 'true' || 
                              sessionStorage.getItem('isPwa') === 'true';
      
      // URL параметр - важный индикатор, так как устанавливается middleware
      const hasUrlPwaParam = window.location.href.includes('pwa=true');
      
      // Обновленное определение PWA статуса:
      // 1. Реальный PWA через API браузера
      // 2. Наличие специальной куки realer-pwa
      // 3. Комбинация обычной куки/localStorage И URL параметра
      const isPWA = isRealPWA || hasRealerPwaCookie || (storedPwaStatus && hasUrlPwaParam);
      
      // Расширенное логирование
      console.log('AUTH PAGE: PWA check details:', { 
        displayMode, 
        isRealPWA,
        hasRealerPwaCookie,
        storedPwaStatus, 
        hasUrlPwaParam,
        isPWA,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        standalone: (window.navigator as any).standalone,
        matchMedia: window.matchMedia('(display-mode: standalone)').matches
      });
      
      // Если не PWA, перенаправляем на страницу download
      if (!isPWA) {
        console.log('AUTH PAGE: Not in PWA mode, redirecting to download page');
        router.push('/download');
        return false;
      }
      
      // Устанавливаем PWA-флаги для последующих проверок, но только если это реальное PWA
      // или если есть специальная кука
      if (isRealPWA || hasRealerPwaCookie) {
        localStorage.setItem('isPwa', 'true');
        sessionStorage.setItem('isPwa', 'true');
        document.cookie = 'isPwa=true; path=/; max-age=31536000; SameSite=Strict';
        
        // Если это реальное PWA, устанавливаем нашу специальную куку
        if (isRealPWA) {
          document.cookie = 'realer-pwa=true; path=/; max-age=31536000; SameSite=Strict';
        }
      }
      
      return isPWA;
    };
    
    // Проверяем PWA статус при загрузке и после небольшой задержки
    checkPWAStatus();
    const fallbackCheck = setTimeout(checkPWAStatus, 1000);
    
    return () => clearTimeout(fallbackCheck);
  }, [router]);

  // Check if user is already authenticated
  useEffect(() => {
    console.log('AUTH PAGE: useEffect start');
    console.log('window:', typeof window !== 'undefined');
    console.log('localStorage:', typeof localStorage !== 'undefined');
    console.log('supabaseClient:', !!supabaseClient);
    
    const checkUser = async () => {
      try {
        // Проверяем доступность localStorage
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          console.error('AUTH PAGE: localStorage is not available');
          setIsCheckingAuth(false);
          return;
        }
        
        console.log('AUTH PAGE: localStorage is available');

        // Check if Supabase is initialized
        if (typeof window !== 'undefined' && window.supabaseInitError) {
          console.error('AUTH PAGE: Supabase initialization error:', window.supabaseInitError);
          setSupabaseError(`Database connection error: ${window.supabaseInitError}`);
          setIsCheckingAuth(false);
          return;
        }
        
        console.log('AUTH PAGE: No Supabase init errors found');
        
        // Безопасная проверка наличия пользователя в localStorage
        let storedUser = null;
        try {
          console.log('AUTH PAGE: Checking for user in localStorage');
          storedUser = localStorage.getItem('user');
          console.log('AUTH PAGE: User exists in localStorage:', !!storedUser);
        } catch (localStorageError) {
          console.error('AUTH PAGE: Error accessing localStorage:', localStorageError);
        }
        
        if (storedUser) {
          // Безопасный парсинг JSON
          try {
            console.log('AUTH PAGE: Parsing user data from localStorage');
            const userData = JSON.parse(storedUser);
            console.log('AUTH PAGE: Successfully parsed user data, redirecting to home');
            setTimeout(() => {
              console.log('AUTH PAGE: router.push(/)');
              router.push('/');
            }, 100);
          } catch (parseError) {
            console.error('AUTH PAGE: Error parsing user data:', parseError);
            // Удаляем повреждённые данные
            localStorage.removeItem('user');
            setIsCheckingAuth(false);
          }
        } else {
          console.log('AUTH PAGE: No stored user, showing login form');
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('AUTH PAGE: Error checking authentication:', error);
        setIsCheckingAuth(false);
      }
    };
    
    checkUser();
    
    // Adding a fallback to ensure we don't get stuck in loading state
    const timeout = setTimeout(() => {
      if (isCheckingAuth) {
        console.log('AUTH PAGE: Fallback timeout triggered - forcing auth screen to show');
        setIsCheckingAuth(false);
      }
    }, 5000); // 5 second timeout as failsafe
    
    return () => clearTimeout(timeout);
  }, [router, isCheckingAuth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('AUTH PAGE: handleLogin called');
    try {
      console.log('AUTH PAGE: Login attempt with MB ID:', mbId);
      
      // Check if Supabase is properly initialized
      if (typeof window !== 'undefined' && window.supabaseInitError) {
        console.error('AUTH PAGE: Supabase initialization error:', window.supabaseInitError);
        throw new Error(`Database connection error: ${window.supabaseInitError}`);
      }
      
      if (!supabaseClient) {
        console.error('AUTH PAGE: Supabase client is not available');
        throw new Error('Database unavailable. Please check your internet connection and try again.');
      }
      
      console.log('AUTH PAGE: Supabase client is available, querying users table');
      
      // Проверяем, существует ли пользователь в таблице users
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('mb_id', mbId)
        .maybeSingle();
      
      console.log('AUTH PAGE: Query result:', { userData: !!userData, userError });
      
      if (userError) {
        console.error('AUTH PAGE: Database error:', userError);
        if (userError.message.includes('invalid input syntax for type bigint')) {
          throw new Error('Invalid ID format. Please enter numbers only');
        }
        throw new Error(`Database error: ${userError.message}`);
      }
      
      if (!userData) {
        console.error('AUTH PAGE: No user found with mb_id:', mbId);
        throw new Error('User not found');
      }
      
      console.log('AUTH PAGE: User found, checking energy/login date');

      // Проверяем, нужно ли инициализировать энергию пользователя
      const today = new Date().toISOString().split('T')[0]; // Формат YYYY-MM-DD
      let updatedUserData = { ...userData };
      
      // Если у пользователя нет энергии или даты последнего входа, инициализируем их
      if (userData.energy === undefined || userData.energy === null || userData.last_login_date === undefined || userData.last_login_date === null) {
        console.log('AUTH PAGE: Initializing user energy');
        
        // Устанавливаем начальные значения
        const initialEnergy = 1;
        
        // Обновляем данные в базе
        const { data: updatedData, error: updateError } = await supabaseClient
          .from('users')
          .update({ 
            energy: initialEnergy,
            last_login_date: today
          })
          .eq('mb_id', mbId)
          .select()
          .single();
          
        if (updateError) {
          console.error('AUTH PAGE: Error initializing energy:', updateError);
        } else if (updatedData) {
          console.log('AUTH PAGE: Energy initialized successfully');
          updatedUserData = updatedData;
        }
      } else {
        // Если пользователь уже имеет энергию, проверяем, нужно ли увеличить её
        const lastLogin = userData.last_login_date ? new Date(userData.last_login_date).toISOString().split('T')[0] : null;
        
        // Если пользователь не входил сегодня, увеличиваем энергию
        if (lastLogin !== today) {
          console.log('AUTH PAGE: Increasing user energy (last login was not today)');
          
          // Ограничиваем максимальное значение энергии
          const newEnergy = Math.min((userData.energy || 0) + 1, 100);
          
          // Обновляем данные в базе
          const { data: updatedData, error: updateError } = await supabaseClient
            .from('users')
            .update({ 
              energy: newEnergy,
              last_login_date: today
            })
            .eq('mb_id', mbId)
            .select()
            .single();
            
          if (updateError) {
            console.error('AUTH PAGE: Error updating energy:', updateError);
          } else if (updatedData) {
            console.log('AUTH PAGE: Energy updated successfully');
            updatedUserData = updatedData;
          }
        }
      }

      // Сохраняем данные пользователя в localStorage
      console.log('AUTH PAGE: Saving user data to localStorage');
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      console.log('AUTH PAGE: Login successful, redirecting to home page');
      setTimeout(() => {
        console.log('AUTH PAGE: router.push(/) after login');
        router.push('/');
      }, 100);
      
    } catch (err: any) {
      console.error('AUTH PAGE: Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    console.log('AUTH PAGE: RENDER: Showing authentication check loading screen');
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          background: 'radial-gradient(circle at 50% 30%, #0a1a2f 60%, #07101e 100%)',
          fontFamily: 'Segoe UI, Arial, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid #38e0ff',
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
          <div style={{ color: '#7ecbff', fontSize: 18 }}>
            Checking authentication...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#07101e',
        fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          padding: '32px',
          background: 'rgba(20, 40, 70, 0.35)',
          borderRadius: 16,
          border: '2px solid #193a5e',
          boxShadow: '0 0 24px #193a5e55',
        }}
      >
        <h1
          style={{
            color: '#38e0ff',
            fontSize: 32,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 28,
            letterSpacing: 1.2,
            textShadow: '0 0 8px #38e0ff99',
            fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
          }}
        >
          Kashif AI
        </h1>
        
        {supabaseError && (
          <div
            style={{
              backgroundColor: 'rgba(255, 70, 70, 0.2)',
              border: '1px solid #ff4646',
              borderRadius: 8,
              padding: 16,
              marginBottom: 20,
              color: '#ff9999',
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            <p><strong>Connection Error:</strong> {supabaseError}</p>
            <p style={{ marginTop: 8 }}>Please check your internet connection and try reloading the page.</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label
              htmlFor="mbId"
              style={{
                display: 'block',
                color: '#7ecbff',
                marginBottom: 8,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 1.1,
                fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
              }}
            >
              Your ID Number
            </label>
            <input
              id="mbId"
              type="text"
              value={mbId}
              onChange={(e) => setMbId(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: 8,
                border: '2px solid #38e0ff',
                background: 'rgba(20, 40, 70, 0.25)',
                color: '#fff',
                fontSize: 17,
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
                boxShadow: '0 0 8px #38e0ff55',
              }}
              placeholder="Enter your ID number"
              required
              autoFocus
              onFocus={e => e.currentTarget.style.borderColor = '#ffe066'}
              onBlur={e => e.currentTarget.style.borderColor = '#38e0ff'}
            />
          </div>

          {error && (
            <div
              style={{
                color: '#ff7eb9',
                fontSize: 15,
                textAlign: 'center',
                padding: '10px',
                background: 'rgba(255, 126, 185, 0.08)',
                borderRadius: 8,
                boxShadow: '0 0 8px #ff7eb955',
                fontWeight: 600,
                letterSpacing: 1.1,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px 0',
              borderRadius: 8,
              background: 'none',
              border: loading
                ? '2px solid #a0a0a0'
                : '2px solid #38e0ff',
              color: loading ? '#a0a0a0' : '#38e0ff',
              fontWeight: 700,
              fontSize: 18,
              boxShadow: loading ? 'none' : '0 0 8px #38e0ff99',
              letterSpacing: 1.1,
              transition: 'background 0.2s, color 0.2s, border 0.2s',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
            }}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');
        @media (max-width: 600px) {
          div[style*='maxWidth: 400px'] {
            padding: 12px !important;
            border-radius: 8px !important;
          }
          h1 {
            font-size: 22px !important;
            margin-bottom: 14px !important;
          }
          input {
            font-size: 13px !important;
            padding: 8px 10px !important;
            border-radius: 5px !important;
          }
          button {
            font-size: 13px !important;
            padding: 8px 0 !important;
            border-radius: 5px !important;
          }
        }
      `}</style>
    </div>
  );
}

