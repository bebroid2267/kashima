'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import font from '../../public/go.jpg'
import Footer from './components/Footer';
import { Workbox } from 'workbox-window';

const fakeCoeffs = [1.25, 3.88, 1.54, 1.28, 1.06];

// Category-specific prediction messages
const predictionMessages = {
  '30-50': {
    "low": [  // 1.1–1.3x (40%)
      "📡 AI precisely calculated weak activity — confident forecast for short flight.",
      "📉 Chart is currently unstable — but I accurately predict minimal takeoff.",
      "🧠 AI detected signal compression — forecast limited but precise.",
      "🚦 Probability of flight above 1.3x is extremely low, forecast confirmed.",
      "⚙️ Round history indicates imminent drop — entry point defined.",
      "📊 Movement within normal range — recommend not taking risks.",
      "🟢 Confident activity decline — recorded below-average chance.",
      "🎯 Minimal risk — based on analysis, forecast limited but accurate."
    ],
    "medium": [  // 2–5x (30%)
      "🔍 Confident pattern detected — chance to catch up to 5x.",
      "📈 I see growth signals — 3.2x coefficient possible.",
      "🧩 Statistics indicate stable zone — forecast within 4x.",
      "🚀 Wave strengthening — coefficient from 2x is real.",
      "🛠️ AI calculated stable window — may shoot up.",
      "📎 Synchronization with past peak — prediction justified.",
      "🔁 Trajectory repeating — chance up to 5x justified by calculations."
    ],
    "high": [  // 5–10x (30%)
      "🔥 Anomaly detected — powerful surge up to 7x possible.",
      "🌊 Chart repeats model before past record — high potential.",
      "🎲 Rare impulse — AI predicts jump above 6x.",
      "🧠 Artificial intelligence detected critical point — moment of strength.",
      "📡 Warning: chance for 9x, but prediction requires more precise calibration."
    ]
  },
  '50-70': {
    "low": [  // 1.1–1.6x (60%)
      "🧠 Model predicts stable growth up to 1.6x — minimal risk.",
      "📊 Chart shows weak but stable activity.",
      "⚙️ Smooth wave — AI detected safe entry point.",
      "📉 Fluctuations minimal, forecast — up to 1.5x.",
      "🛡️ High accuracy on short segment — bet under control.",
      "📈 Data confirms coefficient won't exceed 1.6x.",
      "🔎 AI discovered predictable movement — excellent moment for careful bet.",
      "🎯 Forecast stable, low impulse — ideal for calm play."
    ],
    "medium": [  // 1.6–2x (20%)
      "🧬 AI caught growth pattern — coefficient may reach 2x.",
      "📡 Confident upward signal — 1.9x boundary quite achievable.",
      "📈 Surge probable — recommend controlling bet up to 2x.",
      "🔍 Match with previous wave — coefficient 1.7–1.9x on horizon."
    ],
    "high": [  // 1.9–4x (20%)
      "⚠️ AI predicted rare deviating signal — growth up to 4x possible.",
      "🚀 Analysis indicates strong impulse — chance up to 3.5x.",
      "💥 Probability of peak growth increasing — moment may be key."
    ]
  },
  '70-85': {
    "low": [  // 1.1–1.7x (85%)
      "🧠 Highest accuracy — AI guarantees forecast within 1.7x.",
      "🎯 Data confirms stable growth — bet under control.",
      "📈 Confident upward movement — perfect for confident entry.",
      "🛡️ AI in full confidence — coefficient up to 1.6x.",
      "📊 Calculations aligned — movement won't exceed 1.7x.",
      "📎 Historical pattern fully matched — confident entry point.",
      "🎯 Forecast approaching ideal — minimal risk.",
      "📡 Model worked scenario at 95% — bet without surprises.",
      "🔐 Everything under control — forecast aimed at maximum predictability."
    ],
    "medium": [  // 1.8–2x (10%)
      "🔍 AI detects surge — coefficient up to 2x possible.",
      "📈 Forecast justified — rare window up to 1.9x open.",
      "💡 Activity flash detected — bet reasonable within 2x."
    ],
    "high": [  // 2–2.5x (5%)
      "⚡ Exceptional case — coefficient up to 2.5x confirmed by AI.",
      "🚀 Unique pattern identified — takeoff chance increased.",
      "💥 AI gave signal for peak point — use this chance."
    ]
  }
};

// Removed French translations - using English only

// Arabic translations removed - using only English translations

// UI text in English
const translations = {
  aiVisionButton: "AI Vision",
  aviatorButton: "Aviator",
  clickForPrediction: "Click AI Vision for prediction",
  download: "Download",
  chanceOfWinning: "Chance of Winning",
  howToIncreaseChance: "HOW TO INCREASE YOUR CHANCES?",
  howToIncreaseDesc: "Make deposits and play Aviator regularly to increase your winning potential. The more active you are, the higher your chances!",
  makeDeposit: "Make Deposit",
  helpMe: "Help Me",
  fullEnergy: "Full",
  homeFooter: "HOME",
  faqFooter: "FAQ"
};

// Get today's date in MSK (UTC+3)
function getTodayMSK() {
  const now = new Date();
  // UTC+3
  const msk = new Date(now.getTime() + (3 * 60 - now.getTimezoneOffset()) * 60000);
  return msk.toISOString().split('T')[0];
}

// Get current time in MSK (UTC+3)
function getNowMSK() {
  const now = new Date();
  return new Date(now.getTime() + (3 * 60 - now.getTimezoneOffset()) * 60000);
}

// --- Unique coefficients for chance ranges ---
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
      // Exclude generation of values in range 1.3-2.0
      const rand = Math.random();
      if (rand < 0.4) {
        // Low: 1.1-1.3x (40%)
        value = +(Math.random() * (1.3 - 1.1) + 1.1).toFixed(2);
      } else if (rand < 0.7) {
        // Medium: 2-5x (30%) - nothing in gap 1.3-2.0
        value = +(Math.random() * (5 - 2.0) + 2.0).toFixed(2);
      } else {
        // High: 5-10x (30%)
        value = +(Math.random() * (10 - 5.0) + 5.0).toFixed(2);
      }
    } else if (range === '50-70') {
      // For 50-70%: no gaps in ranges, but overlap issue
      // 1.6-2.0 (medium) and 1.9-4.0 (high) overlap
      const rand = Math.random();
      if (rand < 0.6) {
        // Low: 1.1-1.6x (60%)
        value = +(Math.random() * (1.6 - 1.1) + 1.1).toFixed(2);
      } else if (rand < 0.8) {
        // Medium: 1.6-1.9x (20%) - avoid overlap with high
        value = +(Math.random() * (1.9 - 1.6) + 1.6).toFixed(2);
      } else {
        // High: 1.9-4x (20%)
        value = +(Math.random() * (4.0 - 1.9) + 1.9).toFixed(2);
      }
    } else if (range === '70-85') {
      // For 70-85%: check for no gaps
      const rand = Math.random();
      if (rand < 0.85) {
        // Low: 1.1-1.7x (85%)
        value = +(Math.random() * (1.7 - 1.1) + 1.1).toFixed(2);
      } else if (rand < 0.95) {
        // Medium: 1.8-2.0x (10%) - considering step size
        value = +(Math.random() * (2.0 - 1.8) + 1.8).toFixed(2);
      } else {
        // High: 2.0-2.5x (5%)
        value = +(Math.random() * (2.5 - 2.0) + 2.0).toFixed(2);
      }
    }
    
    // Exclude unwanted boundary values and zeros
    if (value >= 0.01 && !isNaN(value)) {
      set.add(value);
    }
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

function getCoeffColor(coefficient: number, chance: number): string {
  // Determine chance category
  const range = getRangeByChance(chance);
  
  if (range === '30-50') {
    // For 30-50% chance
    if (coefficient <= 1.3) return '#52c41a'; // Green for low (1.1-1.3x) - 40%
    if (coefficient < 5.0) return '#faad14'; // Yellow for medium (2-5x) - 30%
    return '#ff4d4f'; // Red for high (5-10x) - 30%
  } 
  else if (range === '50-70') {
    // For 50-70% chance
    if (coefficient <= 1.6) return '#52c41a'; // Green for low (1.1-1.6x) - 60%
    if (coefficient < 1.9) return '#faad14'; // Yellow for medium (1.6-1.9x) - 20%
    return '#ff4d4f'; // Red for high (1.9-4x) - 20%
  } 
  else if (range === '70-85') {
    // For 70-85% chance
    if (coefficient <= 1.7) return '#52c41a'; // Green for low (1.1-1.7x) - 85%
    if (coefficient <= 2.0) return '#faad14'; // Yellow for medium (1.8-2.0x) - 10%
    return '#ff4d4f'; // Red for high (2.0-2.5x) - 5%
  }
  
  // For other cases (default)
  return '#ffe066'; // Default yellow
}

// Ensure we handle null/undefined supabase client
const supabaseClient = supabase as SupabaseClient | undefined;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [coefficient, setCoefficient] = useState<number | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [aviatorUrl, setAviatorUrl] = useState<string>('');
  const [depositUrl, setDepositUrl] = useState<string>('');
  const [helpLink, setHelpLink] = useState<string>('');
  const [testDepositLoading, setTestDepositLoading] = useState(false);
  const [testDepositResult, setTestDepositResult] = useState<string | null>(null);
  const [user, setUser] = useState<any>(() => {
    // Initialize user from localStorage (SSR-safe)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(() => {
    // If user exists in localStorage, don't show loader
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
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // State for tracking the last timer cycle when energy was awarded
  const [lastEnergyAwardCycle, setLastEnergyAwardCycle] = useState<string | null>(null);
  // State for tracking whether all users update is currently in progress
  const [isUpdatingAllUsers, setIsUpdatingAllUsers] = useState(false);
  
  // Add PWA mode check on page load
  useEffect(() => {
    // Function to check PWA mode
    const checkPWAStatus = () => {
      
      // Используем ту же функцию обнаружения PWA
      const getPWADisplayMode = () => {
        if (typeof window === 'undefined') return 'browser';
        
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (document.referrer.startsWith('android-app://')) {
          return 'twa';
        } else if ((window.navigator as any).standalone || isStandalone) {
          return 'standalone';
        }
        return 'browser';
      };
      
      const displayMode = getPWADisplayMode();
      
      // Прежде всего проверяем настоящие признаки PWA
      const isRealPWA = displayMode !== 'browser';
      
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
      
      console.log('PWA check on main page:', { 
        displayMode, 
        isRealPWA,
        hasRealerPwaCookie,
        storedPwaStatus, 
        hasUrlPwaParam,
        isPWA,
        userAgent: navigator.userAgent 
      });
      
      // Если не PWA, перенаправляем на страницу download
      if (!isPWA) {
        console.log('Not in PWA mode, redirecting to download page');
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
    
    // Выполняем проверку сразу и через короткую задержку
    const isPWA = checkPWAStatus();
    
    // Добавляем повторную проверку через короткое время
    const fallbackCheck = setTimeout(() => {
      checkPWAStatus();
    }, 1000);
    
    return () => clearTimeout(fallbackCheck);
  }, [router]);

  // PWA installation logic
  useEffect(() => {
    console.log('PWA installation effect running');
    
    // Use the same function for reliable PWA detection
    const getPWADisplayMode = () => {
      if (typeof window === 'undefined') return 'browser';
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (document.referrer.startsWith('android-app://')) {
        return 'twa';
      } else if ((window.navigator as any).standalone || isStandalone) {
        return 'standalone';
      }
      return 'browser';
    };
    
    // Check if we're in standalone mode (already installed as PWA)
    const displayMode = getPWADisplayMode();
    const isStandalone = displayMode !== 'browser';
    
    console.log('PWA display mode check:', { displayMode, isStandalone });
    
    if (isStandalone) {
      console.log('App is running in standalone mode (installed as PWA)');
      // Set PWA flags for consistent detection
      localStorage.setItem('isPwa', 'true');
      sessionStorage.setItem('isPwa', 'true');
      document.cookie = 'isPwa=true; path=/; max-age=31536000; SameSite=Strict';
      setShowInstallButton(false);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event triggered');
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install button
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    console.log('beforeinstallprompt listener added');

    // Check if the app is already installed
    window.addEventListener('appinstalled', () => {
      console.log('App installed event triggered');
      // Set PWA flags for consistent detection
      localStorage.setItem('isPwa', 'true');
      sessionStorage.setItem('isPwa', 'true');
      document.cookie = 'isPwa=true; path=/; max-age=31536000; SameSite=Strict';
      setShowInstallButton(false);
    });

    return () => {
      console.log('Cleaning up PWA installation listeners');
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
    
    if (outcome === 'accepted') {
      // Set PWA flags for consistent detection
      localStorage.setItem('isPwa', 'true');
      sessionStorage.setItem('isPwa', 'true');
      document.cookie = 'isPwa=true; path=/; max-age=31536000; SameSite=Strict';
    }
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    
    // Hide the install button
    setShowInstallButton(false);
  };

  // Функция для проверки и обновления энергии за текущий цикл
  const checkAndProcessEnergyCycle = async () => {
    if (!supabaseClient || !user) return;
    
    try {
      const currentCycleId = getTodayMSK();
      console.log('Checking energy accrual cycle:', currentCycleId);
      console.log('Current energy value in state:', energy);
      console.log('Current energy value for user:', user.energy);
      
      // Проверяем, был ли этот цикл уже обработан
      const { data: existingCycle, error: cycleCheckError } = await supabaseClient
        .from('energy_update_cycles')
        .select('*')
        .eq('cycle_id', currentCycleId)
        .single();
      
      if (cycleCheckError && cycleCheckError.code !== 'PGRST116') {
        console.error('Ошибка при проверке цикла:', cycleCheckError);
        return;
      }
      
      // Если цикл уже обработан, запоминаем это в состоянии
      if (existingCycle) {
        console.log('Energy accrual cycle already executed:', existingCycle);
        setLastEnergyAwardCycle(currentCycleId);
        return;
      }
      
      // ВАЖНО: При обычной загрузке страницы не начисляем энергию автоматически
      // Только запоминаем состояние цикла для будущих проверок
      console.log('Energy accrual cycle not found, but not performing automatic accrual on load');
      
      // Начисление энергии всем будет происходить только при истечении таймера
      // или при явном вызове updateAllUsersEnergy()
      
    } catch (error) {
      console.error('Ошибка при проверке цикла начисления энергии:', error);
    }
  };

  // Проверка авторизации и обновление энергии при загрузке компонента
  useEffect(() => {
    console.log('AUTH CHECK: Starting authentication check...');
    
    // Проверка доступности localStorage
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.error('AUTH CHECK: localStorage is not available');
      return;
    }
    
    console.log('AUTH CHECK: localStorage is available');
    
    // Check if Supabase is initialized
    if (typeof window !== 'undefined' && window.supabaseInitError) {
      console.error('AUTH CHECK: Supabase initialization error:', window.supabaseInitError);
      setSupabaseError(`Ошибка подключения к базе данных: ${window.supabaseInitError}`);
      return;
    }
    
    console.log('AUTH CHECK: No Supabase init errors found');
    
    if (!supabaseClient) {
      console.error('AUTH CHECK: Supabase client is not available');
      setSupabaseError('База данных недоступна. Проверьте интернет-соединение и попробуйте перезагрузить страницу.');
      return;
    }
    
    console.log('AUTH CHECK: Supabase client is available');
    
    // Безопасное получение данных пользователя
    let storedUser = null;
    try {
      console.log('AUTH CHECK: Trying to get user from localStorage');
      const storedUserStr = localStorage.getItem('user');
      console.log('AUTH CHECK: localStorage "user" item exists:', !!storedUserStr);
      
      if (storedUserStr) {
        storedUser = JSON.parse(storedUserStr);
        console.log('AUTH CHECK: Successfully parsed user data');
      }
    } catch (error) {
      console.error('AUTH CHECK: Error accessing or parsing localStorage data:', error);
      localStorage.removeItem('user');
      router.push('/auth');
      return;
    }
    
    if (!storedUser) {
      console.log('AUTH CHECK: No stored user, redirecting to auth page');
      setIsCheckingAuth(true);
      router.push('/auth');
      return;
    }
    
    console.log('AUTH CHECK: User found in localStorage, setting up state');
    const userData = storedUser;
    setUser(userData);
    setEnergy(userData.energy || 0);
    setMaxEnergy(userData.max_energy || 100);
    setLastLoginDate(userData.last_login_date || null);
    setChance(userData.chance || 0);
    setIsCheckingAuth(false); // Сразу убираем лоадер
    console.log('AUTH CHECK: Authentication check complete, local user data loaded');

    // Фоновая проверка и обновление данных
    (async () => {
      try {
        console.log('AUTH CHECK: Starting background user data check with Supabase');
        const { data, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('mb_id', userData.mb_id)
          .single();
          
        console.log('AUTH CHECK: Background check result:', { data: !!data, error });
        if (data) {
          console.log('AUTH CHECK: User data from DB:', { 
            energy: data.energy, 
            max_energy: data.max_energy,
            last_login_date: data.last_login_date
          });
        }
        
        if (error) {
          console.error('AUTH CHECK: Error getting user data:', error);
          // Если ошибка критичная (например, пользователь удалён) — разлогиниваем
          if (error.code === 'PGRST116') {
            localStorage.removeItem('user');
            setUser(null);
            router.push('/auth');
          }
        } else if (data) {
          // Проверяем last_login_date
          const today = getTodayMSK();
          const lastLogin = data.last_login_date || null;
          console.log('AUTH CHECK: Checking last login date', { today, lastLogin });
          
          let needEnergyUpdate = false;
          let newEnergy = data.energy || 0;
          
          // Если last_login_date не сегодня, начисляем +1 энергии за вход
          if (lastLogin !== today) {
            console.log('AUTH CHECK: Last login date is not today, updating energy');
            console.log('AUTH CHECK: Current energy before update:', data.energy);
            newEnergy = Math.min((data.energy || 0) + 1, data.max_energy || 100);
            console.log('AUTH CHECK: New energy after update:', newEnergy);
            needEnergyUpdate = true;
          }
          
          // Обновляем данные в базе только если требуется
          if (needEnergyUpdate && supabaseClient) {
            const { error: updateError } = await supabaseClient
              .from('users')
              .update({ energy: newEnergy, last_login_date: today })
              .eq('mb_id', data.mb_id);
            
            if (updateError) {
              console.error('AUTH CHECK: Error updating energy:', updateError);
            } else {
              // Обновляем локальные данные
              data.energy = newEnergy;
              data.last_login_date = today;
              console.log('AUTH CHECK: Energy updated successfully in DB');
            }
          }
          
          // Обновляем состояние
          console.log('AUTH CHECK: Updating state with fresh data from Supabase');
          console.log('AUTH CHECK: Energy being set to:', data.energy);
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
          setEnergy(data.energy || 0);
          setMaxEnergy(data.max_energy || 100);
          setLastLoginDate(data.last_login_date);
          setChance(data.chance || 0);
          
          // Проверяем и обрабатываем цикл начисления энергии
          checkAndProcessEnergyCycle();
        }
      } catch (error) {
        console.error('AUTH CHECK: Error in background check:', error);
      }
    })();
  }, [router]);

  // Таймер до следующей энергии - восстанавливаем для отсчета до 00:00 МСК
  useEffect(() => {
    if (!lastLoginDate) return;
    let interval: NodeJS.Timeout;
    
    function getNextEnergyTime() {
      if (!lastLoginDate) return new Date();
      
      // Получаем текущую дату по МСК
      const now = getNowMSK();
      
      // Создаем дату следующего обновления (00:00 МСК следующего дня)
      const next = new Date(now);
      next.setDate(next.getDate() + 1);
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
      
      // Выводим отладочную информацию
      console.log('Timer:', {
        now: now.toISOString(),
        next: next.toISOString(),
        diff: diff,
        lastLoginDate: lastLoginDate
      });
      
      if (diff <= 0) {
        // Если таймер истек, обновляем lastLoginDate на сегодня
        const today = getTodayMSK();
        setLastLoginDate(today);
        
        // Обновляем lastLoginDate в базе данных
        if (user) {
          if (supabaseClient) {
            supabaseClient.from('users').update({ last_login_date: today }).eq('mb_id', user.mb_id);
          } else {
            console.error('Supabase client is not available, cannot update last_login_date');
          }
          const updatedUser = { ...user, last_login_date: today };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        // При истечении таймера начисляем энергию всем пользователям
        // если это ещё не было сделано
        const currentCycleId = getTodayMSK();
        if (lastEnergyAwardCycle !== currentCycleId) {
          console.log('Timer expired, checking need for energy accrual');
          
          // Проверяем еще раз в базе данных
          (async () => {
            if (!supabaseClient) return;
            
            const { data: existingCycle, error: cycleCheckError } = await supabaseClient
              .from('energy_update_cycles')
              .select('*')
              .eq('cycle_id', currentCycleId)
              .single();
            
            if (cycleCheckError && cycleCheckError.code !== 'PGRST116') {
              console.error('Error checking cycle:', cycleCheckError);
              return;
            }
            
            if (existingCycle) {
              console.log('Energy accrual cycle was already executed earlier:', existingCycle);
              setLastEnergyAwardCycle(currentCycleId);
              return;
            }
            
            // Если цикл не был обработан, начисляем энергию
            console.log('Energy accrual cycle not found, performing accrual');
            updateAllUsersEnergy();
          })();
        } else {
          console.log('Timer expired, but energy was already accrued today');
        }
        
        // Перезапускаем таймер для следующего дня
        setTimeout(updateTimer, 100);
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
  }, [lastLoginDate, energy, maxEnergy, user, lastEnergyAwardCycle]);

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

  // Анимация нейронной сети
  useEffect(() => {
    const canvas = starCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let animationFrame: number;
    let running = true;

    // 8 точек, координаты фиксированные (по кругу)
    const R = Math.min(width, height) / 2.5;
    const centerX = width / 2;
    const centerY = height / 2;
    const points = Array.from({ length: 8 }, (_, i) => {
      const angle = (2 * Math.PI * i) / 8;
      return {
        x: centerX + R * Math.cos(angle),
        y: centerY + R * Math.sin(angle),
        size: 5 + Math.random() * 2
      };
    });

    let t = 0;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      
      // Если не загрузка, просто очищаем canvas и выходим
      if (!isLoading) {
        if (running) animationFrame = requestAnimationFrame(draw);
        return;
      }

      t += 0.04;
      points.forEach((pt, i) => {
        // Пульсация радиуса
        const pulse = 0.7 + 0.3 * Math.abs(Math.sin(t + i));
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#7c5fff';
        ctx.globalAlpha = 0.5 + 0.5 * pulse;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      if (running) animationFrame = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      running = false;
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
        
        // Ограничиваем количество дней, чтобы энергия не заполнялась до максимума сразу
        const maxDaysToAdd = 3; // Максимум 3 дня энергии за раз
        const daysToAdd = Math.min(daysPassed, maxDaysToAdd);
        
        let newEnergy = Math.min((userData.energy || 0) + daysToAdd, userData.max_energy || 100);
        
        if (newEnergy > userData.energy) {
          if (supabaseClient) {
            await supabaseClient
              .from('users')
              .update({ energy: newEnergy, last_login_date: today })
              .eq('mb_id', userData.mb_id);
          } else {
            console.error('Supabase client is not available, cannot update energy');
          }
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

  // Function to get a random prediction message based on coefficient and chance category
  const getRandomPredictionMessageByChanceAndCoeff = (chance: number, coefficient: number): string => {
    const range = getRangeByChance(chance);
    
    if (range === 'default') {
      return "Prediction formed";
    }
    
    // Determine subcategory based on coefficient value - точно в соответствии с generateUniqueCoeffs
    let subcategory = "low";
    
    if (range === '30-50') {
      // Пограничные случаи направляем в ближайшую категорию
      if (coefficient <= 1.3) {
        subcategory = "low";       // Low: 1.1-1.3x (40%)
      } else if (coefficient < 2.0) {
        // Обработка случаев "между категориями" 1.3-2.0
        console.warn(`Внимание: коэффициент ${coefficient} попадает в запрещенный диапазон 1.3-2.0 для шанса ${chance}`);
        // Смотрим, к какому краю ближе и выбираем соответствующую категорию
        subcategory = (coefficient - 1.3 < 2.0 - coefficient) ? "low" : "medium";
      } else if (coefficient < 5.0) {
        subcategory = "medium";    // Medium: 2-5x (30%)
      } else {
        subcategory = "high";      // High: 5-10x (30%)
      }
    } 
    else if (range === '50-70') {
      if (coefficient <= 1.6) {
        subcategory = "low";       // Low: 1.1-1.6x (60%)
      } else if (coefficient < 1.9) {
        subcategory = "medium";    // Medium: 1.6-1.9x (20%)
      } else {
        subcategory = "high";      // High: 1.9-4x (20%)
      }
    } 
    else if (range === '70-85') {
      if (coefficient <= 1.7) {
        subcategory = "low";       // Low: 1.1-1.7x (85%)
      } else if (coefficient < 2.0) {
        subcategory = "medium";    // Medium: 1.8-2.0x (10%)
      } else {
        subcategory = "high";      // High: 2.0-2.5x (5%)
      }
    }
    
    // Дополнительный отладочный вывод
    console.log(`Selected subcategory: ${subcategory} for coefficient ${coefficient} and chance ${chance}`);
    console.log(`Chance range: ${range}, percentage: ${chance}%, coefficient: ${coefficient}x`);
    
    // Using only English translations
    const messageCollection = predictionMessages;
    
    const messages = messageCollection[range as keyof typeof messageCollection][subcategory as "low" | "medium" | "high"];
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };

  // Modify the handleAIVisionClick function to use the category-specific messages
  const handleAIVisionClick = async () => {
    if (energy < 1) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 1000);
      return;
    }

    if (!user) {
      router.push('/auth');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Check if Supabase client is available
      if (!supabaseClient) {
        throw new Error('Database unavailable. Please try reloading the page.');
      }
      
      // Уменьшаем энергию на 1
      const newEnergy = energy - 1;
      
      // Сначала обновляем локальное состояние
      setEnergy(newEnergy);
      
      // Обновляем только energy в базе данных
      if (!supabaseClient) {
        console.error('Supabase client is not available, cannot update energy');
        throw new Error('Database unavailable. Please try reloading the page.');
      }
      
      const { error } = await supabaseClient
        .from('users')
        .update({ energy: newEnergy })
        .eq('mb_id', user.mb_id);

      if (error) {
        console.error('Ошибка при обновлении энергии:', error);
        // В случае ошибки восстанавливаем предыдущее значение энергии
        setEnergy(energy);
      } else {
        // Обновляем только energy в localStorage и user-стейте
        const updatedUser = { ...user, energy: newEnergy };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Выводим в консоль для отладки
        console.log('Energy decreased:', energy, '->', newEnergy);
      }

      // Simulate loading for 3 seconds
      setTimeout(() => {
        setIsLoading(false);
        let newCoefficient = getUniqueCoefficient(chance);
        console.log(`Generated initial coefficient: ${newCoefficient}`);
        
        // Проверка на попадание в запрещенные диапазоны
        const range = getRangeByChance(chance);
        if (range === '30-50') {
          // Проверяем, не попал ли коэффициент в запрещенный диапазон 1.3-2.0
          if (newCoefficient > 1.3 && newCoefficient < 2.0) {
            console.warn(`Detected coefficient ${newCoefficient} in forbidden range 1.3-2.0. Correcting...`);
            // Force select nearest boundary
            newCoefficient = (newCoefficient - 1.3 < 2.0 - newCoefficient) ? 1.3 : 2.0;
            console.log(`Coefficient corrected to: ${newCoefficient}`);
          }
        } else if (range === '70-85') {
          // Для 70-85% проверяем пробел между low и medium (1.7-1.8)
          if (newCoefficient > 1.7 && newCoefficient < 1.8) {
            console.warn(`Detected coefficient ${newCoefficient} in forbidden range 1.7-1.8. Correcting...`);
            newCoefficient = (newCoefficient - 1.7 < 1.8 - newCoefficient) ? 1.7 : 1.8;
            console.log(`Coefficient corrected to: ${newCoefficient}`);
          }
        }
        
        setCoefficient(newCoefficient);
        setCurrentMessage(getRandomPredictionMessageByChanceAndCoeff(chance, newCoefficient));
      }, 3000);
    } catch (err: any) {
      console.error('Error in AI Vision:', err);
      setSupabaseError(err.message || 'An error occurred');
      setIsLoading(false);
    }
  };

  // Fetch URLs from Supabase
  useEffect(() => {
    const fetchUrls = async () => {
      try {
        console.log('Fetching URLs from Supabase...');
        
        // Check if Supabase client is available
        if (!supabaseClient) {
          console.error('Supabase client is not available');
          return;
        }
        
        const { data, error } = await supabaseClient
          .from('actual_url')
          .select('aviator_url, deposit_url, help_link')
          .single();
        
        if (error) {
          console.error('Error fetching URLs:', error);
          return;
        }
        
        if (data) {
          if (data.aviator_url) setAviatorUrl(data.aviator_url);
          if (data.deposit_url) setDepositUrl(data.deposit_url);
          if (data.help_link) setHelpLink(data.help_link);
        } else {
          console.warn('No URLs found in the data');
        }
      } catch (error) {
        console.error('Error in fetchUrls:', error);
      }
    };
    
    fetchUrls();
  }, []);

  // Function to handle button clicks
  const handleDepositClick = () => {
    console.log('Deposit button clicked, current URL:', depositUrl);
    if (depositUrl) {
      window.open(depositUrl, '_blank');
    } else {
      console.error('Deposit URL not available');
    }
  };

  const handleHelpClick = () => {
    console.log('Help button clicked, current URL:', helpLink);
    if (helpLink) {
      window.open(helpLink, '_blank');
    } else {
      console.error('Help link not available');
    }
  };

  // Function to handle Aviator button click
  const handleAviatorClick = () => {
    console.log('Aviator button clicked, current URL:', aviatorUrl);
    if (aviatorUrl) {
      window.open(aviatorUrl, '_blank');
    } else {
      console.error('Aviator URL not available');
    }
  };

  // Function to handle test deposit - make a POST request to /api/deposit
  const handleTestDeposit = async () => {
    if (!user) return;
    
    try {
      setTestDepositLoading(true);
      setTestDepositResult(null);
      
      // Create payload for the deposit endpoint
      const payload = {
        user_id: user.mb_id,
        deposit: 50 // Test deposit amount of $50
      };
      
      // Make the POST request
      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setTestDepositResult('Success! Deposit processed. New chance: ' + result.chance + '%');
        
        // Update local user state with new values
        if (result.chance) {
          const updatedUser = { 
            ...user, 
            deposit_amount: result.deposit_amount,
            chance: result.chance 
          };
          setUser(updatedUser);
          setChance(result.chance);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } else {
        setTestDepositResult('Error: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error making test deposit:', error);
      setTestDepositResult('Error making deposit request');
    } finally {
      setTestDepositLoading(false);
    }
  };

  // Service worker registration
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const wb = new Workbox('/sw.js');
      
      wb.addEventListener('installed', event => {
        console.log('Service Worker installed:', event);
      });
      
      wb.addEventListener('activated', event => {
        console.log('Service Worker activated:', event);
      });
      
      wb.addEventListener('message', event => {
        console.log('Message from Service Worker:', event);
      });
      
      wb.addEventListener('waiting', event => {
        console.log('Service Worker is waiting to be activated:', event);
        // Можно добавить логику обновления
      });
      
      // Register the service worker
      wb.register()
        .then(registration => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    } else {
      console.warn('Service Worker is not supported or disabled');
    }
  }, []);

  // Функция для обновления энергии всех пользователей
  const updateAllUsersEnergy = async () => {
    if (isUpdatingAllUsers) return; // Предотвращаем параллельное выполнение
    
    try {
      setIsUpdatingAllUsers(true);
      
      // Генерируем ID текущего цикла из даты
      const currentCycleId = getTodayMSK();
      
      // Проверяем, не была ли уже начислена энергия в этом цикле
      if (lastEnergyAwardCycle === currentCycleId) {
        console.log('Energy was already accrued to all users in current cycle:', currentCycleId);
        setIsUpdatingAllUsers(false);
        return;
      }
      
      console.log('Accruing energy to all users...');
      console.log('Current energy value before accrual:', energy);
      
      // Запрос к API для обновления энергии всех пользователей
      const response = await fetch('/api/update-all-energy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cycleId: currentCycleId })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('Energy successfully accrued to all users:', result);
        
        // Обновляем состояние для текущего пользователя
        if (user) {
          console.log('Updating energy for current user');
          console.log('Current energy value:', energy, 'max:', maxEnergy);
          const newEnergy = Math.min((energy || 0) + 1, maxEnergy || 100);
          console.log('New energy value:', newEnergy);
          
          // Запрашиваем свежее значение энергии из базы
          const { data: freshUserData, error: userError } = await supabaseClient!
            .from('users')
            .select('energy')
            .eq('mb_id', user.mb_id)
            .single();
            
          if (userError) {
            console.error('Error getting fresh user data:', userError);
          } else if (freshUserData) {
            console.log('Fresh energy value from DB:', freshUserData.energy);
            setEnergy(freshUserData.energy || 0);
            
            // Обновляем локальные данные пользователя
            const updatedUser = { ...user, energy: freshUserData.energy };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('User state updated with fresh data');
          } else {
            // Если не удалось получить свежие данные, используем локальный расчет
            setEnergy(newEnergy);
            
            // Обновляем локальные данные пользователя
            const updatedUser = { ...user, energy: newEnergy };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('User state updated based on local calculation');
          }
        }
        
        // Запоминаем, что энергия начислена в этом цикле
        setLastEnergyAwardCycle(currentCycleId);
      } else {
        console.error('Ошибка при обновлении энергии всех пользователей:', result.error);
      }
    } catch (error) {
      console.error('Ошибка при обновлении энергии всех пользователей:', error);
    } finally {
      setIsUpdatingAllUsers(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    console.log('RENDER: Showing authentication check loading screen');
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
          alignItems: 'center', // Changed from 'stretch' to 'center' to ensure spinner is visible
          justifyContent: 'center', // Changed from 'flex-start' to 'center' for better visibility
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
            Checking authorization...
          </div>
          <button 
            onClick={() => router.push('/auth')}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              borderRadius: 8,
              background: 'rgba(56, 224, 255, 0.2)',
              border: '1px solid #38e0ff',
              color: '#38e0ff',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Go to Authorization
          </button>
        </div>
      </div>
    );
  }

  // Show error if Supabase initialization failed
  if (supabaseError) {
    console.log('RENDER: Showing Supabase error screen');
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          background: 'radial-gradient(circle at 50% 30%, #0a1a2f 60%, #07101e 100%)',
          fontFamily: 'Segoe UI, Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            backgroundColor: 'rgba(255, 70, 70, 0.2)',
            border: '1px solid #ff4646',
            borderRadius: 12,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <h2 style={{ color: '#ff9999', fontSize: 22, textAlign: 'center' }}>
            Connection Error
          </h2>
          <p style={{ color: '#ff9999', fontSize: 16, textAlign: 'center', lineHeight: 1.5 }}>
            {supabaseError}
          </p>
          <p style={{ color: '#7ecbff', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            Please check your internet connection and try reloading the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              backgroundColor: '#1a3b5a',
              color: '#38e0ff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontSize: 16,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Reload
          </button>
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
          marginTop: 8
        }}
      >
        <div
          style={{
            color: '#fff',
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 1.2,
            textShadow: '0 0 8px #38e0ff99',
            fontFamily: "'montserrat', Arial, Helvetica, sans-serif",
          }}
        >
          Kashif AI
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
          padding: '0 5vw 120px 5vw',
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
                  minHeight: 240,
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
                  transition: 'background 0.3s, box-shadow 0.3s, border 0.3s',
                  marginBottom: 0,
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
                    justifyContent: 'center',
                    animation: 'fadeIn 0.5s',
                    direction: 'ltr',
                    width: '90%',
                    height: '100%',
                    zIndex: 2
                  }}>
                    <div style={{ 
                      fontSize: 32, 
                      marginBottom: 10, 
                      fontWeight: 500, 
                      color: getCoeffColor(coefficient, chance), 
                      textShadow: `0 0 3px ${getCoeffColor(coefficient, chance)}66`
                    }}>
                      {coefficient.toFixed(2)}x
                    </div>
                    <div style={{ 
                      fontSize: 16, 
                      color: '#7ecbff', 
                      textShadow: '0 0 4px #7ecbff66',
                      textAlign: 'center',
                      width: '100%',
                      maxWidth: '280px',
                      padding: '0 5px'
                    }}>
                      {currentMessage}
                    </div>
                  </div>
                )}
                {!isLoading && !coefficient && (
                  <div 
                    className="ai-prediction-hint"
                    style={{ 
                      opacity: 0.7, 
                      color: '#fff', 
                      textShadow: '0 0 8px #7ecbff99',
                      fontSize: 22,
                      textAlign: 'center',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      direction: 'ltr',
                      zIndex: 2
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
                  marginTop: 0,
                  marginBottom: 0,
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
                    direction: 'ltr'
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
                    background: 'linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 18,
                    boxShadow: '0 0 16px #ff4d4f99',
                    letterSpacing: 1.1,
                    transition: 'background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
                    outline: 'none',
                    position: 'relative',
                    direction: 'ltr'
                  }}
                  onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 24px #ff7875cc'; }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 16px #ff4d4f99'; }}
                >
                  Aviator
                </button>
              </div>
              {/* ЭНЕРГИЯ */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: 44,
                borderRadius: 16,
                boxShadow: '0 0 8px #ffe06655',
                border: '2px solid #38e0ff',
                margin: '4px auto 8px auto',
                overflow: 'hidden',
                background: 'rgba(30,40,60,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 18px',
                gap: 10,
              }}>
                {/* Количество энергии */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 800,
                  fontSize: 18,
                  color: '#fff',
                  letterSpacing: 0.5,
                  minWidth: 80,
                  justifyContent: 'flex-start',
                }}>
                  <span style={{ fontSize: 22, marginRight: 6 }}>⚡</span>
                  {energy}/{maxEnergy}
                </div>
                {/* Прогресс-бар */}
                <div style={{
                  flex: 1,
                  height: 12,
                  background: '#232b3a',
                  borderRadius: 6,
                  margin: '0 8px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 0 6px #ffe06633',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${(energy / maxEnergy) * 100}%`,
                    background: 'linear-gradient(90deg, #ff4d4f 0%, #ffe066 50%, #52c41a 100%)',
                    borderRadius: 6,
                    transition: 'width 0.3s',
                  }} />
                </div>
                {/* Таймер или Full energy */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 700,
                  fontSize: 15,
                  color: '#fff',
                  minWidth: 80,
                  justifyContent: 'flex-end',
                  gap: 5,
                }}>
                  {energy < maxEnergy && (
                    <>
                      <span>{energyTimer}</span>
                      <span style={{ color: '#ffe066', fontSize: 18 }}>⏰</span>
                    </>
                  )}
                  {energy >= maxEnergy && (
                    <>
                      <span>Full</span>
                      <span style={{ color: '#ffe066', fontSize: 18 }}>⚡</span>
                    </>
                  )}
                </div>
              </div>
              {/* ШАНС и инфо-блок */}
              <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 4,
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
                        padding: '9px 16px',
                        marginTop: 4,
                        marginBottom: 4,
                        textAlign: 'center',
                        position: 'relative',
                        width: '100%',
                      }}>
                        <div style={{
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 15,
                          marginBottom: 0,
                          textShadow: '0 0 8px #7ecbff99',
                          fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
                        }}>
                          Chance of winning
                        </div>
                        <div style={{
                          fontSize: 27,
                          fontWeight: 500,
                          color: chanceColor,
                          textShadow: `0 0 6px ${chanceColor}55`,
                          marginBottom: 2,
                        }}>
                          {chance.toFixed(2)}%
                        </div>
                        <div style={{
                          width: '100%',
                          height: 7,
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
                        marginTop: 2,
                        marginBottom: 4,
                        width: '100%',
                      }}>
                        <div style={{
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 600,
                          marginBottom: 8,
                          textAlign: 'center',
                          textShadow: '0 0 8px #ffe06644',
                        }}>
                          HOW TO INCREASE YOUR CHANCE?
                        </div>
                        <div style={{
                          color: '#7ecbff',
                          fontSize: 10,
                          lineHeight: '1.5',
                          textAlign: 'center',
                          direction: 'ltr'
                        }}>
                          Make deposits and play Aviator regularly to increase your winning potential. The more active you are, the higher your chances become!
                        </div>
                      </div>
                      {/* Кнопки для депозита и помощи */}
                      <div style={{
                        display: 'flex',
                        gap: 12,
                        width: '100%',
                        marginTop: 4,
                        marginBottom: 4,
                        justifyContent: 'center',
                      }}>
                        <button
                          onClick={handleDepositClick}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: 8,
                            border: 'none',
                            background: 'linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 16,
                            boxShadow: '0 0 16px #ff4d4f99',
                            letterSpacing: 1.1,
                            transition: 'background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s',
                            cursor: 'pointer',
                            fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
                            outline: 'none',
                            position: 'relative',
                            direction: 'ltr'
                          }}
                          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 24px #ff7875cc'; }}
                          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 16px #ff4d4f99'; }}
                        >
                          Make Deposit
                        </button>
                        <button
                          onClick={handleHelpClick}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: 8,
                            border: 'none',
                            background: 'linear-gradient(90deg, #faad14 0%, #fa8c16 100%)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 16,
                            boxShadow: '0 0 16px #faad1499',
                            letterSpacing: 1.1,
                            transition: 'background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s',
                            cursor: 'pointer',
                            fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
                            outline: 'none',
                            position: 'relative',
                            direction: 'ltr'
                          }}
                          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 24px #faad14cc'; }}
                          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 16px #faad1499'; }}
                        >
                          Help Me
                        </button>
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
          main > div > div > div[style*='flex-direction: column'] {
            gap: 4px !important;
          }
        }
        @media (max-width: 600px) {
          html, body {
            overflow-x: hidden !important;
            width: 100vw !important;
          }
          header {
            padding: 10px 4vw 6px 4vw !important;
            gap: 8px !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            margin-top: 24px !important;
          }
          header > div:first-child {
            font-size: 18px !important;
            letter-spacing: 0.8px !important;
            margin-bottom: 0 !important;
          }
          header > div:last-child {
            width: auto !important;
            justify-content: flex-end !important;
          }
          header button {
            font-size: 12px !important;
            padding: 4px 12px !important;
            border-radius: 6px !important;
          }
          main {
            padding: 0 4vw 70px 4vw !important;
          }
          main > div {
            gap: 8px !important;
          }
          main > div > div {
            min-width: 0 !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
          /* Предсказание */
          main > div > div > div > div[style*="minHeight"] {
            min-height: 170px !important;
            font-size: 13px !important;
            margin: 0 !important;
            border-width: 1.5px !important;
          }
          /* Кнопки */
          main > div > div > div > div[style*="display: flex"][style*="gap: 12px"] {
            padding: 0 !important;
            margin: 2px 0 !important;
            gap: 8px !important;
          }
          main > div > div > div > div[style*="display: flex"][style*="gap: 12px"] button {
            font-size: 12px !important;
            padding: 8px 0 !important;
            border-radius: 5px !important;
          }
          /* Энергия */
          main > div > div > div > div[style*="position: relative"][style*="width: 100%"] {
            height: 30px !important;
            margin: 0 0 10px 0 !important;
            border-width: 0.5px !important;
            padding: 0 6px !important;
          }
          main > div > div > div > div[style*="position: relative"][style*="width: 100%"] > div:first-child {
            font-size: 14px !important;
            min-width: 60px !important;
          }
          main > div > div > div > div[style*="position: relative"][style*="width: 100%"] > div:first-child span {
            font-size: 16px !important;
          }
          main > div > div > div > div[style*="position: relative"][style*="width: 100%"] > div:last-child {
            font-size: 12px !important;
            min-width: 70px !important;
          }
          main > div > div > div > div[style*="position: relative"][style*="width: 100%"] > div:nth-child(2) {
            height: 8px !important;
          }
          /* Шанс */
          main > div > div > div > div[style*="border-radius: 12px"][style*="border: 2px solid"] {
            padding: 2px 4px !important;
            border-width: 0.5px !important;
            margin: 10px 0 0 0 !important;
            max-height: 45px !important;
          }
          main > div > div > div > div[style*="border-radius: 12px"][style*="border: 2px solid"] > div:first-child {
            font-size: 14px !important;
            margin-bottom: 2px !important;
          }
          main > div > div > div > div[style*="border-radius: 12px"][style*="border: 2px solid"] > div:nth-child(2) {
            font-size: 24px !important;
            margin-bottom: 2px !important;
          }
          main > div > div > div > div[style*="border-radius: 12px"][style*="border: 2px solid"] > div:last-child {
            height: 6px !important;
          }
          /* Информационный блок - делаем ещё меньше */
          main > div > div > div > div[style*="border: 2px solid #38e0ff"] {
            margin: 0 !important;
            padding: 4px 8px !important;
            border-width: 1px !important;
            max-height: 40px !important;
            overflow: hidden !important;
          }
          main > div > div > div > div[style*="border: 2px solid #38e0ff"] > div:first-child {
            font-size: 9px !important;
            margin-bottom: 1px !important;
            letter-spacing: -0.2px !important;
          }
          main > div > div > div > div[style*="border: 2px solid #38e0ff"] > div:last-child {
            font-size: 8px !important;
            line-height: 1.2 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          /* Кнопки внизу */
          main > div > div > div > div:last-child button {
            font-size: 12px !important;
            padding: 6px 0 !important;
            border-radius: 5px !important;
          }
          .ai-prediction-hint {
            font-size: 16px !important;
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
        /* Специальная настройка для очень маленьких экранов по высоте */
        @media (max-height: 700px) and (max-width: 600px) {
          /* Уменьшаем блок предсказания */
          main > div > div > div > div[style*="minHeight"] {
            min-height: 130px !important;
          }
          
          /* Кнопки под блоком предсказания */
          main > div > div > div > div[style*="display: flex"][style*="gap: 12px"] {
            margin: 0 !important;
          }
          main > div > div > div > div[style*="display: flex"][style*="gap: 12px"] button {
            padding: 6px 0 !important;
          }
          
          /* Энергия */
          main > div > div > div > div[style*="position: relative"][style*="width: 100%"] {
            height: 28px !important;
            margin: 0 !important;
          }
          
          /* Шанс - сильно уменьшаем */
          main > div > div > div > div[style*="border-radius: 12px"][style*="border: 2px solid"] {
            padding: 4px 6px !important;
            margin: 0 !important;
            max-height: 60px !important;
          }
          main > div > div > div > div[style*="border-radius: 12px"][style*="border: 2px solid"] > div:first-child {
            font-size: 10px !important;
            margin-bottom: 0 !important;
          }
          main > div > div > div > div[style*="border-radius: 12px"][style*="border: 2px solid"] > div:nth-child(2) {
            font-size: 20px !important;
            margin-bottom: 0 !important;
          }
          main > div > div > div > div[style*="border-radius: 12px"][style*="border: 2px solid"] > div:last-child {
            height: 4px !important;
          }
          
          /* Информационный блок - предельно минимизируем */
          main > div > div > div > div[style*="border: 2px solid #38e0ff"] {
            padding: 2px 4px !important;
            max-height: 25px !important;
            border-width: 0.5px !important;
          }
          main > div > div > div > div[style*="border: 2px solid #38e0ff"] > div:first-child {
            font-size: 7px !important;
            margin-bottom: 0 !important;
          }
          main > div > div > div > div[style*="border: 2px solid #38e0ff"] > div:last-child {
            font-size: 6px !important;
            line-height: 1.1 !important;
            -webkit-line-clamp: 1 !important;
          }
          
          /* Кнопки внизу */
          main > div > div > div > div:last-child {
            margin: 0 !important;
          }
          main > div > div > div > div:last-child button {
            padding: 4px 0 !important;
            font-size: 11px !important;
          }
        }
        /* Кардинально уменьшаем все блоки на мобильной версии */
        @media (max-width: 600px) {
          /* Общие настройки */
          main {
            padding: 0 4vw 30px 4vw !important;
          }
          main > div {
            gap: 4px !important;
          }
          
          /* Уменьшаем блок предсказания */
          main > div > div > div > div[style*="minHeight"] {
            min-height: 120px !important;
            border-width: 1px !important;
            margin-bottom: 12px !important;
          }
          
          /* Кнопки под блоком предсказания */
          main > div > div > div > div[style*="display: flex"][style*="gap: 12px"] {
            margin: 0 0 8px 0 !important;
            gap: 4px !important;
          }
          main > div > div > div > div[style*="display: flex"][style*="gap: 12px"] button {
            font-size: 12px !important;
            padding: 8px 0 !important;
            border-radius: 5px !important;
          }
          
          /* Энергия */
          main > div > div > div > div[style*="position: relative"][style*="width: 100%"] {
            height: 24px !important;
            margin: 0 0 10px 0 !important;
            border-width: 0.5px !important;
            padding: 0 6px !important;
          }
          main > div > div > div > div[style*="position: relative"][style*="width: 100%"] > div:first-child {
            font-size: 10px !important;
            min-width: 40px !important;
          }
          main > div > div > div > div[style*="position: relative"][style*="width: 100%"] > div:first-child span {
            font-size: 12px !important;
          }
          main > div > div > div > div[style*="position: relative"][style*="width: 100%"] > div:last-child {
            font-size: 9px !important;
            min-width: 50px !important;
          }
          main > div > div > div > div[style*="position: relative"][style*="width: 100%"] > div:nth-child(2) {
            height: 4px !important;
          }
          
          /* Шанс - сильно уменьшаем */
          main > div > div > div > div[style*="border-radius: 12px"][style*="border: 2px solid"] {
            padding: 2px 4px !important;
            border-width: 0.5px !important;
            margin: 10px 0 0 0 !important;
            max-height: 45px !important;
          }
          main > div > div > div > div[style*="border-radius: 12px"][style*="border: 2px solid"] > div:first-child {
            font-size: 9px !important;
            margin-bottom: 0 !important;
          }
          main > div > div > div > div[style*="border-radius: 12px"][style*="border: 2px solid"] > div:nth-child(2) {
            font-size: 16px !important;
            margin-bottom: 0 !important;
            line-height: 1 !important;
          }
          main > div > div > div > div[style*="border-radius: 12px"][style*="border: 2px solid"] > div:last-child {
            height: 3px !important;
          }
          
          /* Информационный блок - делаем экстремально маленьким */
          main > div > div > div > div[style*="border: 2px solid #38e0ff"] {
            padding: 2px 3px !important;
            border-width: 0.5px !important;
            margin: 0 !important;
            max-height: 26px !important;
            overflow: hidden !important;
          }
          main > div > div > div > div[style*="border: 2px solid #38e0ff"] > div:first-child {
            font-size: 6px !important;
            margin: 0 !important;
            line-height: 1.1 !important;
            letter-spacing: -0.2px !important;
            white-space: nowrap !important;
            text-overflow: ellipsis !important;
            overflow: hidden !important;
          }
          main > div > div > div > div[style*="border: 2px solid #38e0ff"] > div:last-child {
            font-size: 6px !important;
            line-height: 1.1 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 1 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            height: 8px !important;
          }
          
          /* Кнопки внизу */
          main > div > div > div > div:last-child {
            margin: 0 !important;
          }
          main > div > div > div > div:last-child button {
            font-size: 10px !important;
            padding: 3px 0 !important;
          }
        }
        /* Для мобильных устройств с высотой больше 700px - увеличиваем кнопки внизу */
        @media (max-width: 600px) and (min-height: 700px) {
          /* Хедер */
          header {
            margin-top: 30px !important;
          }
          
          main > div > div > div > div[style*="minHeight"] {
            margin-bottom: 15px !important;
          }
          
          main > div > div > div > div[style*="display: flex"][style*="gap: 12px"] {
            margin: 0 0 12px 0 !important;
          }
          
          /* Увеличиваем отступы между блоками */
          main > div > div > div > div[style*="position: relative"][style*="width: 100%"] {
            height: 34px !important;
            margin: 0 0 15px 0 !important;
          }
          
          main > div > div > div > div[style*="border-radius: 12px"][style*="border: 2px solid"] {
            margin: 15px 0 0 0 !important;
          }
          
          main > div > div > div > div:last-child button {
            font-size: 12px !important;
            padding: 8px 0 !important;
            height: 36px !important;
          }
        }
        /* Дополнительная настройка для очень маленьких экранов по высоте */
        @media (max-height: 700px) and (max-width: 600px) {
          main {
            padding: 0 4vw 15px 4vw !important;
          }
          
          /* Хедер */
          header {
            margin-top: 16px !important;
          }
          
          /* Уменьшаем блок предсказания еще сильнее */
          main > div > div > div > div[style*="minHeight"] {
            min-height: 100px !important;
            max-height: 100px !important;
            overflow: hidden !important;
            margin-bottom: 8px !important;
          }
          
          /* Кнопки под блоком предсказания */
          main > div > div > div > div[style*="display: flex"][style*="gap: 12px"] {
            margin: 0 0 6px 0 !important;
          }
          
          /* Энергия - добавляем отступ снизу */
          main > div > div > div > div[style*="position: relative"][style*="width: 100%"] {
            height: 28px !important;
            margin: 0 0 8px 0 !important;
          }
          
          /* Шанс - добавляем отступ сверху */
          main > div > div > div > div[style*="border-radius: 12px"][style*="border: 2px solid"] {
            margin: 8px 0 0 0 !important;
          }
          
          main > div > div > div > div:last-child button {
            padding: 4px 0 !important;
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  );
}
