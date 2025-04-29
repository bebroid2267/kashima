'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import font from '../../public/go.jpg'
import Footer from './components/Footer';

const fakeCoeffs = [1.25, 3.88, 1.54, 1.28, 1.06];

// Array of 20+ different prediction messages
const predictionMessages = [
  "Market analysis completed",
  "Growth trend detected",
  "Success pattern identified",
  "Probability calculation completed",
  "Prediction formed",
  "Algorithm determined optimal path",
  "Data processed successfully",
  "Model predicted result",
  "Analysis completed successfully",
  "Coefficient calculation completed",
  "Prediction ready for display",
  "Algorithm determined perspective",
  "Calculation completed successfully", 
  "Data analysis completed",
  "Prediction formed successfully",
  "Calculation completed",
  "Algorithm determined result",
  "Analysis completed",
  "Prediction ready",
  "Coefficient calculation completed",
  "Analysis completed successfully",
  "Prediction formed",
  "Calculation completed successfully"
];

// Получить сегодняшнюю дату по МСК (UTC+3)
function getTodayMSK() {
  const now = new Date();
  // UTC+3
  const msk = new Date(now.getTime() + (3 * 60 - now.getTimezoneOffset()) * 60000);
  return msk.toISOString().split('T')[0];
}

// Получить текущее время по МСК (UTC+3)
function getNowMSK() {
  const now = new Date();
  return new Date(now.getTime() + (3 * 60 - now.getTimezoneOffset()) * 60000);
}

// --- Уникальные коэффициенты для диапазонов шанса ---
declare global {
  interface Window {
    __coeffPoolsRef?: {
      '30-50': number[];
      '50-70': number[];
      '70-85': number[];
    };
  }
}

const coeffPoolsRef: { [key: string]: number[] } = typeof window !== 'undefined'
  ? (window.__coeffPoolsRef || (window.__coeffPoolsRef = { '30-50': [], '50-70': [], '70-85': [] }))
  : { '30-50': [], '50-70': [], '70-85': [] };

function generateUniqueCoeffs(range: string, count: number): number[] {
  const set = new Set<number>();
  while (set.size < count) {
    let value: number = 0;
    if (range === '30-50') {
      const rand = Math.random();
      if (rand < 0.7) value = +(Math.random() * (1.5 - 1.1) + 1.1).toFixed(2);
      else if (rand < 0.9) value = +(Math.random() * (3 - 1.5) + 1.5).toFixed(2);
      else value = +(Math.random() * (10 - 5) + 5).toFixed(2);
    } else if (range === '50-70') {
      const rand = Math.random();
      if (rand < 0.85) value = +(Math.random() * (3 - 1.2) + 1.2).toFixed(2);
      else value = +(Math.random() * (5 - 3) + 3).toFixed(2);
    } else if (range === '70-85') {
      const rand = Math.random();
      if (rand < 0.95) value = +(Math.random() * (2 - 1.1) + 1.1).toFixed(2);
      else value = +(Math.random() * (3 - 2) + 2).toFixed(2);
    }
    set.add(value);
  }
  return Array.from(set);
}

function getRangeByChance(chance: number): string {
  if (chance >= 30 && chance < 50) return '30-50';
  if (chance >= 50 && chance < 70) return '50-70';
  if (chance >= 70 && chance <= 85) return '70-85';
  return 'default';
}

function getUniqueCoefficient(chance: number): number {
  const range = getRangeByChance(chance);
  if (range === 'default') return +(Math.random() * (2 - 1.2) + 1.2).toFixed(2);
  if (coeffPoolsRef[range].length === 0) {
    const count = range === '70-85' ? 20 : 10;
    coeffPoolsRef[range] = generateUniqueCoeffs(range, count);
  }
  const idx = Math.floor(Math.random() * coeffPoolsRef[range].length);
  const coeff = coeffPoolsRef[range][idx];
  coeffPoolsRef[range].splice(idx, 1);
  return coeff;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [coefficient, setCoefficient] = useState<number | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [aviatorUrl, setAviatorUrl] = useState<string>('');
  const [user, setUser] = useState<any>(() => {
    // Инициализация user из localStorage (SSR-safe)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(() => {
    // Если user есть в localStorage, не показываем лоадер
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('user');
    }
    return true;
  });
  const [energy, setEnergy] = useState<number>(0);
  const [maxEnergy, setMaxEnergy] = useState<number>(100);
  const [lastLoginDate, setLastLoginDate] = useState<string | null>(null);
  const [chance, setChance] = useState<number>(0);
  const [energyTimer, setEnergyTimer] = useState<string>('00:00:00');
  const [showFlash, setShowFlash] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const router = useRouter();
  const starCanvasRef = useRef<HTMLCanvasElement>(null);
  const [starAnimActive, setStarAnimActive] = useState(true);

  // PWA installation logic
  useEffect(() => {
    // Check if we're in standalone mode (already installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone || 
                         document.referrer.includes('android-app://');
    
    if (isStandalone) {
      setShowInstallButton(false);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install button
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is already installed
    window.addEventListener('appinstalled', () => {
      setShowInstallButton(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Function to handle PWA installation
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    
    // Hide the install button
    setShowInstallButton(false);
  };

  // Check authentication state and update energy
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setIsCheckingAuth(true);
      router.push('/auth');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    setEnergy(userData.energy || 0);
    setMaxEnergy(userData.max_energy || 100);
    setLastLoginDate(userData.last_login_date || null);
    setChance(userData.chance || 0);
    setIsCheckingAuth(false); // Сразу убираем лоадер

    // Фоновая проверка и обновление данных
    (async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('mb_id', userData.mb_id)
          .single();
        if (error) {
          console.error('Ошибка при получении данных пользователя:', error);
          // Если ошибка критичная (например, пользователь удалён) — разлогиниваем
          if (error.code === 'PGRST116') {
            localStorage.removeItem('user');
            setUser(null);
            router.push('/auth');
          }
        } else if (data) {
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
          setEnergy(data.energy || 0);
          setMaxEnergy(data.max_energy || 100);
          setLastLoginDate(data.last_login_date);
          setChance(data.chance || 0);
          await checkAndUpdateEnergy(data);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    })();
  }, [router]);

  // Таймер до следующей энергии
  useEffect(() => {
    if (!lastLoginDate) return;
    let interval: NodeJS.Timeout;
    function getNextEnergyTime() {
      if (!lastLoginDate) return new Date();
      const last = new Date(lastLoginDate + 'T00:00:00+03:00');
      const next = new Date(last);
      next.setDate(last.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      return next;
    }
    function updateTimer() {
      if (energy >= maxEnergy) {
        setEnergyTimer('');
        return;
      }
      const now = getNowMSK();
      const next = getNextEnergyTime();
      const diff = next.getTime() - now.getTime();
      if (diff <= 0) {
        if (energy < maxEnergy) {
          const newEnergy = Math.min(energy + 1, maxEnergy);
          setEnergy(newEnergy);
          const today = getTodayMSK();
          setLastLoginDate(today);
          if (user) {
            supabase.from('users').update({ energy: newEnergy, last_login_date: today }).eq('mb_id', user.mb_id);
            const updatedUser = { ...user, energy: newEnergy, last_login_date: today };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
        setEnergyTimer('');
        return;
      }
      const hours = Math.floor(diff / 1000 / 60 / 60).toString().padStart(2, '0');
      const minutes = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
      const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
      setEnergyTimer(`${hours}:${minutes}:${seconds}`);
    }
    updateTimer();
    interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastLoginDate, energy, maxEnergy, user]);

  // Flash появляется только после задержки, когда трещины нарисованы
  useEffect(() => {
    if (isLoading) {
      setShowFlash(false);
      const timeout = setTimeout(() => setShowFlash(true), 1200); // 1.2 сек — время появления всех трещин
      return () => clearTimeout(timeout);
    } else {
      setShowFlash(false);
    }
  }, [isLoading]);

  // Анимация звёздного гиперпространства
  useEffect(() => {
    const canvas = starCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let animationFrame: number;
    let running = true;
    // Больше звёзд
    let stars = Array.from({ length: 320 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * width,
      prevX: 0,
      prevY: 0,
    }));
    function resize() {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      // Делаем хвосты длиннее и glow сильнее
      const speed = isLoading ? 28 : 7;
      const tail = isLoading ? 180 : 90;
      for (let star of stars) {
        star.prevX = star.x;
        star.prevY = star.y;
        star.z -= speed;
        if (star.z <= 0) {
          star.x = Math.random() * width;
          star.y = Math.random() * height;
          star.z = width;
        }
        const k = tail / star.z;
        const sx = (star.x - width / 2) * k + width / 2;
        const sy = (star.y - height / 2) * k + height / 2;
        ctx.beginPath();
        ctx.moveTo(star.prevX, star.prevY);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = isLoading ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,220,0.85)';
        ctx.lineWidth = isLoading ? 3.2 : 1.7;
        ctx.shadowColor = isLoading ? '#fffbe6' : '#ffe066';
        ctx.shadowBlur = isLoading ? 32 : 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
        star.x = sx;
        star.y = sy;
      }
      if (isLoading && showFlash) {
        ctx.fillStyle = 'rgba(255,255,255,0.97)';
        ctx.fillRect(0, 0, width, height);
      }
      if (running) animationFrame = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      running = false;
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [isLoading, showFlash]);

  // Функция для проверки и обновления энергии
  const checkAndUpdateEnergy = async (userData: any) => {
    try {
      const today = getTodayMSK();
      const lastLogin = userData.last_login_date || null;
      if (lastLogin !== today) {
        // Считаем разницу в днях по МСК
        const last = lastLogin ? new Date(lastLogin + 'T00:00:00+03:00') : new Date();
        const now = new Date(getTodayMSK() + 'T00:00:00+03:00');
        const daysPassed = Math.max(1, Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)));
        let newEnergy = Math.min((userData.energy || 0) + daysPassed, userData.max_energy || 100);
        if (newEnergy > userData.energy) {
          await supabase
            .from('users')
            .update({ energy: newEnergy, last_login_date: today })
            .eq('mb_id', userData.mb_id);
          setEnergy(newEnergy);
          setLastLoginDate(today);
          const updatedUser = { ...userData, energy: newEnergy, last_login_date: today };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Ошибка при проверке и обновлении энергии:', error);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      // Удаляем пользователя из localStorage
      localStorage.removeItem('user');
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Function to get a random prediction message
  const getRandomPredictionMessage = () => {
    const randomIndex = Math.floor(Math.random() * predictionMessages.length);
    return predictionMessages[randomIndex];
  };

  // Function to handle the AI Vision button click
  const handleAIVisionClick = async () => {
    if (energy <= 0) {
      alert('Недостаточно энергии для использования AI Vision.');
      return;
    }

    setIsLoading(true);
    setPrediction(null);
    setCoefficient(null);
    setCurrentMessage("ИИ печатает предсказание");

    // Уменьшаем энергию на 1
    const newEnergy = energy - 1;
    setEnergy(newEnergy);

    // Обновляем только energy в базе данных
    const { error } = await supabase
      .from('users')
      .update({ energy: newEnergy })
      .eq('mb_id', user.mb_id);

    if (error) {
      console.error('Ошибка при обновлении энергии:', error);
    }

    // Обновляем только energy в localStorage и user-стейте
    const updatedUser = { ...user, energy: newEnergy };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // Simulate loading for 3 seconds
    setTimeout(() => {
      setIsLoading(false);
      setCurrentMessage(getRandomPredictionMessage());
      setCoefficient(getUniqueCoefficient(chance));
    }, 3000);
  };

  // Fetch Aviator URL from Supabase
  useEffect(() => {
    const fetchAviatorUrl = async () => {
      try {
        console.log('Fetching Aviator URL from Supabase...');
        const { data, error } = await supabase
          .from('actual_url')
          .select('aviator_url')
          .single();
        
        if (error) {
          console.error('Error fetching Aviator URL:', error);
          return;
        }
        
        
        if (data && data.aviator_url) {
          setAviatorUrl(data.aviator_url);
        } else {
          console.warn('No Aviator URL found in the data');
        }
      } catch (error) {
        console.error('Error in fetchAviatorUrl:', error);
      }
    };
    
    fetchAviatorUrl();
  }, []);

  // Function to handle Aviator button click
  const handleAviatorClick = () => {
    console.log('Aviator button clicked, current URL:', aviatorUrl);
    if (aviatorUrl) {
      window.open(aviatorUrl, '_blank');
    } else {
      console.error('Aviator URL not available');
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          background: '#07101e',
          backgroundImage: `url(${font.src})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          overflowX: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(7, 16, 30, 0.7)',
            zIndex: 1,
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            position: 'relative',
            zIndex: 2,
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
            Проверка авторизации...
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the page content
  if (!user) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#07101e',
        backgroundImage: `url(${font.src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 16, 30, 0.7)',
          zIndex: 1,
        }}
      />
      {/* HEADER */}
      <header
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 5vw 12px 5vw',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            color: '#38e0ff',
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 1.2,
            textShadow: '0 0 8px #38e0ff99',
            fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
          }}
        >
          Kashif AI
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {showInstallButton && (
            <button
              onClick={handleInstallClick}
              style={{
                background: 'none',
                color: '#ffe066',
                fontWeight: 700,
                fontSize: 18,
                borderRadius: 8,
                padding: '10px 28px',
                textDecoration: 'none',
                boxShadow: '0 0 8px #ffe06655',
                letterSpacing: 1.1,
                transition: 'background 0.2s, color 0.2s',
                cursor: 'pointer',
                fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
              }}
            >
              Download
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              color: '#ff7eb9',
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 8,
              padding: '10px 28px',
              textDecoration: 'none',
              boxShadow: '0 0 8px #ff7eb955',
              letterSpacing: 1.1,
              transition: 'background 0.2s, color 0.2s',
              cursor: 'pointer',
              fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
            }}
          >
            Exit
          </button>
        </div>
      </header>
      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0 5vw 32px 5vw',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 900,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* FLEX GRID */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 24,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {/* LEFT COLUMN */}
            <div
              style={{
                flex: '0 1 520px',
                minWidth: 320,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                alignItems: 'center',
              }}
            >
              {/* ПРЕДСКАЗАНИЕ */}
              <div
                style={{
                  width: '100%',
                  minHeight: 120,
                  border: isLoading ? '2.5px solid #ffe066' : '2.5px solid #38e0ff',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #0a1931 0%, #1e295c 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7ecbff',
                  fontSize: 22,
                  fontWeight: 500,
                  letterSpacing: 0.5,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 0 16px #193a5e55',
                  marginBottom: 16,
                  transition: 'background 0.3s, box-shadow 0.3s, border 0.3s',
                }}
              >
                {/* Canvas звёзд */}
                <canvas
                  ref={starCanvasRef}
                  width={320}
                  height={140}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    pointerEvents: 'none',
                    opacity: 1,
                    transition: 'opacity 0.5s',
                  }}
                />
                {!isLoading && coefficient && (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    animation: 'fadeIn 0.5s'
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 50,fontWeight: 700, color: '#ffe066', textShadow: '0 0 8px #ffe06699' }}>
                      {coefficient.toFixed(2)}x
                    </div>
                    <div style={{ fontSize: 16, marginTop: -15, color: '#7ecbff', textShadow: '0 0 8px #7ecbff99' }}>
                      {currentMessage}
                    </div>
                  </div>
                )}
                {!isLoading && !coefficient && (
                  <div style={{ 
                    opacity: 0.7, 
                    color: '#7ecbff', 
                    textShadow: '0 0 8px #7ecbff99',
                    fontSize: window.innerWidth <= 600 ? 11 : 22,
                    textAlign: 'center',
                    width: '100%',
                    marginTop: 50
                  }}>
                    Click AI Vision for prediction
                  </div>
                )}
              </div>
              {/* КНОПКИ */}
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  width: '100%',
                  marginTop: 4,
                  justifyContent: 'center',
                }}
              >
                <button
                  onClick={handleAIVisionClick}
                  disabled={isLoading || energy <= 0}
                  style={{
                    flex: 1,
                    padding: '14px 0',
                    borderRadius: 8,
                    border: 'none',
                    background: isLoading || energy <= 0
                      ? 'linear-gradient(90deg, #bdbdbd 0%, #ffe06655 100%)'
                      : 'linear-gradient(90deg, #ffe066 0%, #ffb300 100%)',
                    color: isLoading || energy <= 0 ? '#a0a0a0' : '#fff',
                    fontWeight: 700,
                    fontSize: 18,
                    boxShadow: isLoading || energy <= 0 ? 'none' : '0 0 16px #ffe06699',
                    letterSpacing: 1.1,
                    transition: 'background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s',
                    cursor: isLoading || energy <= 0 ? 'not-allowed' : 'pointer',
                    fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
                    outline: 'none',
                    position: 'relative',
                  }}
                  onMouseOver={e => {
                    if (!(isLoading || energy <= 0)) e.currentTarget.style.boxShadow = '0 0 24px #ffe066cc';
                  }}
                  onMouseOut={e => {
                    if (!(isLoading || energy <= 0)) e.currentTarget.style.boxShadow = '0 0 16px #ffe06699';
                  }}
                >
                  AI Vision
                </button>
                <button
                  onClick={handleAviatorClick}
                  style={{
                    flex: 1,
                    padding: '14px 0',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(90deg, #38e0ff 0%, #7c5fff 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 18,
                    boxShadow: '0 0 16px #38e0ff99',
                    letterSpacing: 1.1,
                    transition: 'background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
                    outline: 'none',
                    position: 'relative',
                  }}
                  onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 24px #7c5fffcc'; }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 16px #38e0ff99'; }}
                >
                  Aviator
                </button>
              </div>
              {/* ЭНЕРГИЯ */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: 44,
                borderRadius: 12,
                border: '2px solid #ffe066',
                boxShadow: '0 0 12px #ffe06655',
                marginBottom: 18,
                overflow: 'hidden',
                background: '#fffbe600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Прогресс-бар-заливка */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${(energy / maxEnergy) * 100}%`,
                  background: 'linear-gradient(90deg, #ffe066cc 0%, #ffb300cc 100%)',
                  zIndex: 1,
                  transition: 'width 0.3s',
                }} />
                {/* Контент поверх */}
                <div style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 18px',
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#7a5c00',
                  height: '100%',
                }}>
                  <span style={{ fontSize: 22, color: '#ffb300' }}>⚡</span>
                  <span>{energy}/{maxEnergy}</span>
                  {energy < maxEnergy && (
                    <span style={{ color: '#7a5c00', fontSize: 13, fontWeight: 400 }}>
                      +1 in {energyTimer}
                    </span>
                  )}
                  {energy >= maxEnergy && (
                    <span style={{ color: '#7a5c00', fontSize: 13, fontWeight: 400 }}>
                      Full energy
                    </span>
                  )}
                </div>
              </div>
              {/* ШАНС и инфо-блок */}
              <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 8,
              }}>
                {(() => {
                  const chanceColor =
                    chance < 50 ? '#ff4d4f' :
                    chance < 70 ? '#ffe066' :
                    '#52c41a';
                  return (
                    <>
                      <div style={{
                        background: 'rgba(30, 60, 100, 0.25)',
                        borderRadius: 12,
                        border: `2px solid ${chanceColor}`,
                        boxShadow: `0 0 12px ${chanceColor}33`,
                        padding: '18px 16px',
                        marginTop: 18,
                        marginBottom: 8,
                        textAlign: 'center',
                        position: 'relative',
                        width: '100%',
                      }}>
                        <div style={{
                          color: '#7ecbff',
                          fontWeight: 600,
                          fontSize: 18,
                          marginBottom: 6,
                          textShadow: '0 0 8px #7ecbff99',
                          fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
                        }}>
                          Chance of winning
                        </div>
                        <div style={{
                          fontSize: 36,
                          fontWeight: 800,
                          color: chanceColor,
                          textShadow: `0 0 16px ${chanceColor}99`,
                          marginBottom: 8,
                        }}>
                          {chance.toFixed(2)}%
                        </div>
                        <div style={{
                          width: '100%',
                          height: 10,
                          background: '#193a5e',
                          borderRadius: 5,
                          overflow: 'hidden',
                          margin: '0 auto',
                        }}>
                          <div style={{
                            width: `${Math.min(chance, 100)}%`,
                            height: '100%',
                            background: chanceColor,
                            borderRadius: 5,
                            transition: 'width 0.3s',
                          }} />
                        </div>
                      </div>
                      {/* Информативный блок */}
                      <div style={{
                        background: 'rgba(30, 60, 100, 0.25)',
                        borderRadius: 12,
                        border: '2px solid #38e0ff',
                        boxShadow: '0 0 12px #38e0ff33',
                        padding: '14px',
                        marginTop: 4,
                        marginBottom: 8,
                        width: '100%',
                      }}>
                        <div style={{
                          color: '#ffe066',
                          fontSize: 14,
                          fontWeight: 600,
                          marginBottom: 8,
                          textAlign: 'center',
                          textShadow: '0 0 8px #ffe06644',
                        }}>
                          HOW TO INCREASE YOUR CHANCE?
                        </div>
                        <div style={{
                          color: '#7ecbff',
                          fontSize: 13,
                          lineHeight: '1.5',
                          textAlign: 'center',
                        }}>
                          Make deposits and play Aviator regularly to increase your winning potential. The more active you are, the higher your chances become!
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {/* Адаптивность */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');
        @media (max-width: 900px) {
          main > div {
            flex-direction: column !important;
            gap: 18px !important;
          }
          main > div > div {
            max-width: 100% !important;
            min-width: 0 !important;
          }
        }
        @media (max-width: 600px) {
          html, body {
            overflow-x: hidden !important;
            width: 100vw !important;
          }
          header {
            padding: 12px 4vw !important;
            gap: 12px !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          header > div:first-child {
            font-size: 20px !important;
            letter-spacing: 0.8px !important;
            margin-bottom: 0 !important;
          }
          header > div:last-child {
            width: auto !important;
            justify-content: flex-end !important;
          }
          header button {
            font-size: 14px !important;
            padding: 6px 16px !important;
            border-radius: 6px !important;
          }
          main {
            padding: 0 4vw 30px 4vw !important;
          }
          main > div {
            gap: 16px !important;
          }
          main > div > div {
            min-width: 0 !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
          /* Предсказание */
          main > div > div > div > div[style*='minHeight'] {
            min-height: 60px !important;
            font-size: 13px !important;
            margin: 0 !important;
          }
          /* Кнопки */
          main > div > div > div > div[style*='display: flex'][style*='gap: 12px'] {
            padding: 0 !important;
            margin: 12px 0 !important;
          }
          main > div > div > div > div[style*='display: flex'][style*='gap: 12px'] button {
            font-size: 13px !important;
            padding: 8px 0 !important;
            border-radius: 5px !important;
          }
          /* Энергия */
          main > div > div > div > div[style*='position: relative'][style*='width: 100%'] {
            margin: 8px 0 !important;
          }
          /* Шанс и инфо-блок */
          main > div > div > div > div[style*='textAlign: center'] {
            margin: 8px 0 !important;
            padding: 14px !important;
          }
          main > div > div > div > div[style*='textAlign: center'] div {
            font-size: 12px !important;
          }
          main > div > div > div > div[style*='textAlign: center'] div + div {
            font-size: 18px !important;
          }
          /* Информативный блок */
          main > div > div > div > div:last-child {
            margin: 4px 0 8px 0 !important;
            padding: 12px !important;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes aiStrongPulse {
          0% {
            background: linear-gradient(120deg, #ffe066 0%, #ffb300 50%, #ffe066 100%);
            box-shadow: 0 0 32px 8px #ffe066cc, 0 0 64px 16px #ffb30088;
          }
          50% {
            background: linear-gradient(120deg, #ffb300 0%, #ffe066 50%, #ffb300 100%);
            box-shadow: 0 0 64px 24px #ffe066ee, 0 0 96px 32px #ffb300cc;
          }
          100% {
            background: linear-gradient(120deg, #ffe066 0%, #ffb300 50%, #ffe066 100%);
            box-shadow: 0 0 32px 8px #ffe066cc, 0 0 64px 16px #ffb30088;
          }
        }
        /* Анимация появления трещин */
        .crack { stroke-dasharray: 160; stroke-dashoffset: 160; animation: crackDraw 0.5s forwards; }
        .crack1 { animation-delay: 0.05s; }
        .crack2 { animation-delay: 0.15s; }
        .crack3 { animation-delay: 0.25s; }
        .crack4 { animation-delay: 0.35s; }
        .crack5 { animation-delay: 0.45s; }
        .crack6 { animation-delay: 0.55s; }
        .crack7 { animation-delay: 0.65s; }
        .crack8 { animation-delay: 0.75s; }
        .crack9 { animation-delay: 0.85s; }
        .crack10 { animation-delay: 0.95s; }
        .crack11 { animation-delay: 1.05s; }
        .crack12 { animation-delay: 1.15s; }
        @keyframes crackDraw {
          to { stroke-dashoffset: 0; filter: drop-shadow(0 0 16px #ffe066) drop-shadow(0 0 32px #fffbe6); }
        }
        /* Финальный flash */
        .crack-flash { animation: crackFlash 0.7s forwards; }
        @keyframes crackFlash {
          0% { opacity: 0; }
          60% { opacity: 0.1; }
          80% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
