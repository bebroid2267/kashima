'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [mbId, setMbId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Проверяем, есть ли пользователь в localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Attempting to login with MB ID:', mbId);
      
      // Проверяем, существует ли пользователь в таблице users
      console.log('Querying users table for mb_id:', mbId);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('mb_id', mbId)
        .maybeSingle();
      
      console.log('Query result:', { userData, userError });
      
      if (userError) {
        console.error('Database error:', userError);
        if (userError.message.includes('invalid input syntax for type bigint')) {
          throw new Error('Invalid ID format. Please enter numbers only');
        }
        throw new Error(`Database error: ${userError.message}`);
      }
      
      if (!userData) {
        console.error('No user found with mb_id:', mbId);
        throw new Error('User not found');
      }
      
      console.log('User found:', userData);

      // Проверяем, нужно ли инициализировать энергию пользователя
      const today = new Date().toISOString().split('T')[0]; // Формат YYYY-MM-DD
      let updatedUserData = { ...userData };
      
      // Если у пользователя нет энергии или даты последнего входа, инициализируем их
      if (userData.energy === undefined || userData.energy === null || userData.last_login_date === undefined || userData.last_login_date === null) {
        console.log('Инициализация энергии пользователя');
        
        // Устанавливаем начальные значения
        const initialEnergy = 1;
        
        // Обновляем данные в базе
        const { data: updatedData, error: updateError } = await supabase
          .from('users')
          .update({ 
            energy: initialEnergy,
            last_login_date: today
          })
          .eq('mb_id', mbId)
          .select()
          .single();
          
        if (updateError) {
          console.error('Error initializing energy:', updateError);
        } else if (updatedData) {
          updatedUserData = updatedData;
        }
      } else {
        // Если пользователь уже имеет энергию, проверяем, нужно ли увеличить её
        const lastLogin = userData.last_login_date ? new Date(userData.last_login_date).toISOString().split('T')[0] : null;
        
        // Если пользователь не входил сегодня, увеличиваем энергию
        if (lastLogin !== today) {
          console.log('Увеличиваем энергию пользователя');
          
          // Ограничиваем максимальное значение энергии
          const newEnergy = Math.min((userData.energy || 0) + 1, 100);
          
          // Обновляем данные в базе
          const { data: updatedData, error: updateError } = await supabase
            .from('users')
            .update({ 
              energy: newEnergy,
              last_login_date: today
            })
            .eq('mb_id', mbId)
            .select()
            .single();
            
          if (updateError) {
            console.error('Error updating energy:', updateError);
          } else if (updatedData) {
            updatedUserData = updatedData;
          }
        }
      }

      // Сохраняем данные пользователя в localStorage
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      console.log('Login successful, redirecting to home page');
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
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

