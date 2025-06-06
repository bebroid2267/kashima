'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import font from '../../public/go.jpg'
import Footer from './components/Footer';

const fakeCoeffs = [1.25, 3.88, 1.54, 1.28, 1.06];

// Category-specific prediction messages
const predictionMessages30to50 = [
  "ИИ прогнозирует умеренный рост на основе анализа последних 5 раундов.",
  "Система рекомендует осторожную игру из-за волновой активности графика.",
  "Вероятен низкий коэффициент из-за малого процента удачных сессий сегодня.",
  "Аналитическая система определила средний диапазон на основе текущих показателей.",
  "Прогнозируется небольшой взлёт согласно расчётам на основе последних 10 сессий.",
  "Ожидается стабильный коэффициент из-за умеренных флуктуаций графика.",
  "Модель указывает на небольшой рост по результатам анализа текущей сессии.",
  "Рекомендуется консервативная ставка из-за низкого уровня предсказуемости.",
  "Система определила рост в пределах нормы благодаря стабильным колебаниям коэффициента.",
  "ИИ предлагает соблюдать осторожность в связи с нестабильностью текущей сессии.",
  "Алгоритм фиксирует средний взлёт на основе умеренного сигнала системы.",
  "Прогнозируется умеренный рост исходя из активности на средней волне.",
  "ИИ определил умеренный рост в связи с ограниченным потенциалом текущего раунда.",
  "Система оценивает безопасность полёта как среднюю из-за смешанных сигналов.",
  "Анализ трендов указывает на небольшой подъём в ближайшем раунде."
];

const predictionMessages50to70 = [
  "Технический анализ выявил положительную тенденцию, прогнозируется позитивный рост.",
  "ИИ рассчитал повышенную вероятность успешной сессии для следующего раунда.",
  "Статистика последних взлётов показывает стабильный рост в ближайшем раунде.",
  "Система фиксирует позитивный сигнал, указывающий на успешный раунд.",
  "ИИ определил благоприятный момент для игры с высокой вероятностью выгодной ставки.",
  "Аналитика прогнозирует уверенный рост на основе позитивного тренда графика.",
  "Оптимизированные алгоритмы обеспечивают высокую точность прогноза для текущей сессии.",
  "Система обнаружила закономерность, указывающую на успешную ставку.",
  "Совпадение нескольких факторов создаёт оптимальный момент для входа в игру.",
  "Аналитическая сводка полётов прогнозирует средний подъем графика.",
  "Расчётная система указывает на благоприятный потенциал взлёта.",
  "ИИ видит хорошую возможность для тактической игры с высоким шансом выигрыша.",
  "Система оценивает безопасность полёта как хорошую благодаря стабильной динамике показателей.",
  "Стабильные показатели активности указывают на прогнозируемый рост.",
  "Динамика графика отражает потенциал для положительного исхода."
];

const predictionMessages70to85 = [
  "Идеальное совпадение параметров обеспечивает максимальную точность прогноза.",
  "ИИ прогнозирует высокий потенциал роста в предстоящем раунде.",
  "Аналитическая система в полном согласии, фиксируя оптимальный момент для ставки.",
  "Сильный сигнал от системы указывает на высоковероятную успешную игру.",
  "ИИ определил идеальное время для максимизации прибыли через высокую ставку.",
  "Все показатели системы положительны, рекомендуется активная стратегия.",
  "Расчёты показывают максимальную вероятность высокого успеха в текущей сессии.",
  "Совокупность всех факторов указывает на высокий взлёт в ближайшем раунде.",
  "Модель работает на пике эффективности, обеспечивая исключительную точность прогноза.",
  "Система обнаружила мощный импульс, предвещающий сильный рост коэффициента.",
  "Все индикаторы в зелёной зоне, безопасность полёта оценивается как высокая.",
  "ИИ прогнозирует успешный исход, основываясь на положительных показателях всех индикаторов.",
  "Оптимальные условия для большой ставки с максимальной потенциальной прибылью.",
  "Система подтверждает надёжность высокоточного прогноза на текущую сессию.",
  "ИИ зафиксировал идеальные условия для игры в данный момент."
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

function getCoeffColor(coefficient: number, chance: number): string {
  // Определяем категорию шанса
  const range = getRangeByChance(chance);
  
  if (range === '30-50') {
    // Для шанса 30-50%
    if (coefficient <= 1.5) return '#52c41a'; // Зеленый для безопасных (70% случаев)
    if (coefficient <= 3.0) return '#faad14'; // Желтый для умеренных (20% случаев)
    return '#ff4d4f'; // Красный для высоких (10% случаев)
  } 
  else if (range === '50-70') {
    // Для шанса 50-70%
    if (coefficient <= 2.5) return '#52c41a'; // Зеленый для безопасных (80% случаев)
    if (coefficient <= 4.0) return '#faad14'; // Желтый для умеренных (15% случаев)
    return '#ff4d4f'; // Красный для высоких (5% случаев)
  } 
  else if (range === '70-85') {
    // Для шанса 70-85%
    if (coefficient <= 1.8) return '#52c41a'; // Зеленый для безопасных (85% случаев)
    if (coefficient <= 2.5) return '#faad14'; // Желтый для умеренных (10% случаев)
    return '#ff4d4f'; // Красный для высоких (5% случаев)
  }
  
  // Для других случаев (default)
  return '#ffe066'; // Желтый по умолчанию
}

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
  const router = useRouter();
  const starCanvasRef = useRef<HTMLCanvasElement>(null);
  const [starAnimActive, setStarAnimActive] = useState(true);

  // Check authentication state and update energy
  useEffect(() => {
    // Проверка доступности localStorage
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.error('localStorage is not available');
      return;
    }
    
    // Безопасное получение данных пользователя
    let storedUser = null;
    try {
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        storedUser = JSON.parse(storedUserStr);
      }
    } catch (error) {
      console.error('Error accessing or parsing localStorage data:', error);
      localStorage.removeItem('user');
      // Устанавливаем задержку перед переходом для избежания проблем с состоянием
      setTimeout(() => {
        router.push('/auth');
      }, 300);
      return;
    }
    
    if (!storedUser) {
      setIsCheckingAuth(true);
      // Устанавливаем задержку перед переходом для избежания проблем с состоянием
      setTimeout(() => {
        router.push('/auth');
      }, 300);
      return;
    }
    
    // Устанавливаем дефолтные значения для критических полей, если они отсутствуют
    if (!storedUser.energy) storedUser.energy = 0;
    if (!storedUser.max_energy) storedUser.max_energy = 100;
    if (!storedUser.chance) storedUser.chance = 30;
    
    // Обновляем состояние пользователя
    setUser(storedUser);
    setEnergy(storedUser.energy || 0);
    setMaxEnergy(storedUser.max_energy || 100);
    setLastLoginDate(storedUser.last_login_date || null);
    setChance(storedUser.chance || 0);
    setIsCheckingAuth(false); // Убираем лоадер

    // Фоновая проверка и обновление данных только если есть ID пользователя
    if (storedUser && storedUser.mb_id) {
      (async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('mb_id', storedUser.mb_id)
            .single();
          if (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            // Если ошибка критичная (например, пользователь удалён) — разлогиниваем
            if (error.code === 'PGRST116') {
              localStorage.removeItem('user');
              setUser(null);
              // Устанавливаем задержку перед переходом для избежания проблем с состоянием
              setTimeout(() => {
                router.push('/auth');
              }, 300);
            }
          } else if (data) {
            // Проверяем last_login_date
            const today = getTodayMSK();
            const lastLogin = data.last_login_date || null;
            
            // Если last_login_date не сегодня, начисляем +1 энергии
            if (lastLogin !== today) {
              const newEnergy = Math.min((data.energy || 0) + 1, data.max_energy || 100);
              
              // Обновляем данные в базе
              const { error: updateError } = await supabase
                .from('users')
                .update({ energy: newEnergy, last_login_date: today })
                .eq('mb_id', data.mb_id);
                
              if (updateError) {
                console.error('Ошибка при обновлении энергии:', updateError);
              } else {
                // Обновляем локальные данные
                data.energy = newEnergy;
                data.last_login_date = today;
              }
            }
            
            // Устанавливаем дефолтные значения для критических полей, если они отсутствуют
            if (data.energy === undefined || data.energy === null) data.energy = 0;
            if (!data.max_energy) data.max_energy = 100;
            if (!data.chance) data.chance = 30;
            
            // Обновляем состояние
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            setEnergy(data.energy || 0);
            setMaxEnergy(data.max_energy || 100);
            setLastLoginDate(data.last_login_date);
            setChance(data.chance || 0);
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
        }
      })();
    }
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
      console.log('Таймер:', {
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
          supabase.from('users').update({ last_login_date: today }).eq('mb_id', user.mb_id);
          const updatedUser = { ...user, last_login_date: today };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
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

    // Создаем нейроны
    const neurons = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * width,
      connections: [] as number[],
      speed: Math.random() * 2 + 1,
      size: Math.random() * 3 + 1,
    }));

    // Создаем связи между нейронами
    neurons.forEach((neuron, i) => {
      neuron.connections = Array.from({ length: 3 }, () => 
        Math.floor(Math.random() * neurons.length)
      ).filter(j => j !== i);
    });

    function resize() {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }

    window.addEventListener('resize', resize);

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Если не загрузка, просто очищаем canvas и выходим
      if (!isLoading) {
        // Анимация для обычного состояния (в 2 раза медленнее)
        const defaultSpeed = 2.5; // Половина от скорости при клике

        // Обновляем позиции нейронов
        neurons.forEach(neuron => {
          neuron.z -= defaultSpeed;
          if (neuron.z <= 0) {
            neuron.z = width;
            neuron.x = Math.random() * width;
            neuron.y = Math.random() * height;
          }
        });

        // Рисуем связи и нейроны
        neurons.forEach(neuron => {
          const k = 150 / neuron.z;
          const x = (neuron.x - width / 2) * k + width / 2;
          const y = (neuron.y - height / 2) * k + height / 2;

          // Рисуем связи
          neuron.connections.forEach(connIndex => {
            const connectedNeuron = neurons[connIndex];
            const connK = 150 / connectedNeuron.z;
            const connX = (connectedNeuron.x - width / 2) * connK + width / 2;
            const connY = (connectedNeuron.y - height / 2) * connK + height / 2;

            // Рисуем линию связи
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(connX, connY);
            
            // Градиент для линии
            const gradient = ctx.createLinearGradient(x, y, connX, connY);
            gradient.addColorStop(0, 'rgba(56, 224, 255, 0.2)'); // Более прозрачные линии
            gradient.addColorStop(1, 'rgba(124, 95, 255, 0.2)'); // Более прозрачные линии
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.5; // Тоньше линии
            ctx.shadowColor = '#7c5fff';
            ctx.shadowBlur = 3; // Меньше свечение
            ctx.stroke();
            ctx.shadowBlur = 0;
          });

          // Рисуем нейрон
          ctx.beginPath();
          ctx.arc(x, y, neuron.size * k * 0.8, 0, Math.PI * 2); // Меньше размер
          ctx.fillStyle = '#7c5fff';
          ctx.shadowColor = '#7c5fff';
          ctx.shadowBlur = 4; // Меньше свечение
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        if (running) animationFrame = requestAnimationFrame(draw);
        return;
      }

      // Скорость движения для состояния при клике
      const speed = 5; // Медленная скорость для спокойной анимации

      // Обновляем позиции нейронов
      neurons.forEach(neuron => {
        neuron.z -= speed;
        if (neuron.z <= 0) {
          neuron.z = width;
          neuron.x = Math.random() * width;
          neuron.y = Math.random() * height;
        }
      });

      // Рисуем связи и нейроны
      neurons.forEach(neuron => {
        const k = 150 / neuron.z;
        const x = (neuron.x - width / 2) * k + width / 2;
        const y = (neuron.y - height / 2) * k + height / 2;

        // Рисуем связи
        neuron.connections.forEach(connIndex => {
          const connectedNeuron = neurons[connIndex];
          const connK = 150 / connectedNeuron.z;
          const connX = (connectedNeuron.x - width / 2) * connK + width / 2;
          const connY = (connectedNeuron.y - height / 2) * connK + height / 2;

          // Рисуем линию связи
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(connX, connY);
          
          // Градиент для линии
          const gradient = ctx.createLinearGradient(x, y, connX, connY);
          gradient.addColorStop(0, 'rgba(56, 224, 255, 0.4)'); // Более прозрачные линии
          gradient.addColorStop(1, 'rgba(124, 95, 255, 0.4)'); // Более прозрачные линии
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1; // Тоньше линии
          ctx.shadowColor = '#7c5fff'; // Фиолетовое свечение
          ctx.shadowBlur = 5; // Меньше свечение
          ctx.stroke();
          ctx.shadowBlur = 0;
        });

        // Рисуем нейрон
        ctx.beginPath();
        ctx.arc(x, y, neuron.size * k, 0, Math.PI * 2);
        ctx.fillStyle = '#7c5fff'; // Фиолетовые нейроны
        ctx.shadowColor = '#7c5fff'; // Фиолетовое свечение
        ctx.shadowBlur = 8; // Меньше свечение
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Добавляем свечение при загрузке
      if (showFlash) {
        ctx.fillStyle = 'rgba(124, 95, 255, 0.1)'; // Фиолетовое свечение
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
        
        // Ограничиваем количество дней, чтобы энергия не заполнялась до максимума сразу
        const maxDaysToAdd = 3; // Максимум 3 дня энергии за раз
        const daysToAdd = Math.min(daysPassed, maxDaysToAdd);
        
        let newEnergy = Math.min((userData.energy || 0) + daysToAdd, userData.max_energy || 100);
        
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

  // Function to get a random prediction message based on chance category
  const getRandomPredictionMessageByChance = (chance: number): string => {
    if (chance >= 30 && chance < 50) {
      const randomIndex = Math.floor(Math.random() * predictionMessages30to50.length);
      return predictionMessages30to50[randomIndex];
    } else if (chance >= 50 && chance < 70) {
      const randomIndex = Math.floor(Math.random() * predictionMessages50to70.length);
      return predictionMessages50to70[randomIndex];
    } else if (chance >= 70 && chance <= 85) {
      const randomIndex = Math.floor(Math.random() * predictionMessages70to85.length);
      return predictionMessages70to85[randomIndex];
    } else {
      // Fallback for any other chance value
      return "Прогноз сформирован";
    }
  };

  // Modify the handleAIVisionClick function to use the category-specific messages
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
    
    // Сначала обновляем локальное состояние
    setEnergy(newEnergy);
    
    // Обновляем только energy в базе данных
    const { error } = await supabase
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
      console.log('Энергия уменьшена:', energy, '->', newEnergy);
    }

    // Simulate loading for 3 seconds
    setTimeout(() => {
      setIsLoading(false);
      setCurrentMessage(getRandomPredictionMessageByChance(chance));
      setCoefficient(getUniqueCoefficient(chance));
    }, 3000);
  };

  // Fetch URLs from Supabase
  useEffect(() => {
    const fetchUrls = async () => {
      try {
        console.log('Fetching URLs from Supabase...');
        const { data, error } = await supabase
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
                    <div style={{ 
                      fontSize: 28, 
                      marginBottom: 10, 
                      fontWeight: 700, 
                      color: getCoeffColor(coefficient, chance), 
                      textShadow: `0 0 8px ${getCoeffColor(coefficient, chance)}99`
                    }}>
                      {coefficient.toFixed(2)}x
                    </div>
                    <div style={{ 
                      fontSize: 16, 
                      marginTop: 5, 
                      color: '#7ecbff', 
                      textShadow: '0 0 8px #7ecbff99',
                      textAlign: 'center',
                      width: '90%',
                      padding: '0 5px'
                    }}>
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
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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
                      {energyTimer}
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
                      {/* Кнопки для депозита и помощи */}
                      <div style={{
                        display: 'flex',
                        gap: 12,
                        width: '100%',
                        marginTop: 10,
                        marginBottom: 10,
                        justifyContent: 'center',
                      }}>
                        <button
                          onClick={handleDepositClick}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: 8,
                            border: 'none',
                            background: 'linear-gradient(90deg, #52c41a 0%, #08979c 100%)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 16,
                            boxShadow: '0 0 16px #52c41a99',
                            letterSpacing: 1.1,
                            transition: 'background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s',
                            cursor: 'pointer',
                            fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
                            outline: 'none',
                            position: 'relative',
                          }}
                          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 24px #52c41acc'; }}
                          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 16px #52c41a99'; }}
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
                          }}
                          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 24px #faad14cc'; }}
                          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 16px #faad1499'; }}
                        >
                          Help Me
                        </button>
                      </div>
                      
                      {/* Тестовая кнопка для имитации депозита */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        width: '100%',
                        marginTop: 5,
                        marginBottom: 10,
                      }}>
                        <button
                          onClick={handleTestDeposit}
                          disabled={testDepositLoading}
                          style={{
                            padding: '8px 0',
                            borderRadius: 8,
                            border: 'none',
                            background: 'linear-gradient(90deg, #7c5fff 0%, #ff7eb9 100%)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 14,
                            boxShadow: '0 0 16px #7c5fff77',
                            transition: 'all 0.2s',
                            cursor: testDepositLoading ? 'wait' : 'pointer',
                            fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
                            outline: 'none',
                            opacity: testDepositLoading ? 0.7 : 1
                          }}
                        >
                          {testDepositLoading ? 'Processing...' : 'Test Deposit ($50)'}
                        </button>
                        
                        {testDepositResult && (
                          <div style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            backgroundColor: testDepositResult.includes('Error') 
                              ? 'rgba(255, 77, 79, 0.15)' 
                              : 'rgba(82, 196, 26, 0.15)',
                            color: testDepositResult.includes('Error') ? '#ff4d4f' : '#52c41a',
                            textAlign: 'center'
                          }}>
                            {testDepositResult}
                          </div>
                        )}
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
