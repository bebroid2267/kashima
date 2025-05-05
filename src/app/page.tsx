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
      "📡 AI точно просчитал слабую активность — уверенный прогноз на короткий рейс.",
      "📉 График сейчас нестабилен — но я точно предсказываю минимальный взлёт.",
      "🧠 ИИ зафиксировал сжатие сигнала — прогноз ограничен, но точен.",
      "🚦 Вероятность полёта выше 1.3x крайне мала, прогноз подтверждён.",
      "⚙️ История раундов указывает на скорое падение — точка входа определена.",
      "📊 Движение в пределах нормы — рекомендую не рисковать.",
      "🟢 Уверенное падение активности — зафиксировал шанс ниже среднего.",
      "🎯 Риск минимальный — на основе анализа прогноз ограничен, но точный."
    ],
    "medium": [  // 2–5x (30%)
      "🔍 Обнаружен уверенный паттерн — шанс поймать до 5x.",
      "📈 Вижу сигналы роста — коэффициент 3.2x возможен.",
      "🧩 Статистика указывает на устойчивую зону — прогноз в пределах 4x.",
      "🚀 Волна усиливается — коэффициент от 2x реален.",
      "🛠️ AI вычислил устойчивое окно — может выстрелить.",
      "📎 Синхронизация с прошлым пиком — предсказание обосновано.",
      "🔁 Траектория повторяется — шанс до 5x оправдан расчётами."
    ],
    "high": [  // 5–10x (30%)
      "🔥 Выявлена аномалия — возможен мощный всплеск до 7x.",
      "🌊 График повторяет модель перед прошлым рекордом — потенциал высок.",
      "🎲 Редкий импульс — AI предсказывает скачок выше 6x.",
      "🧠 Искусственный интеллект зафиксировал критическую точку — момент силы.",
      "📡 Предупреждение: шанс на 9x, но предсказание требует более точной калибровки."
    ]
  },
  '50-70': {
    "low": [  // 1.1–1.6x (60%)
      "🧠 Модель предсказывает устойчивый рост до 1.6x — риск минимален.",
      "📊 График показывает слабую, но стабильную активность.",
      "⚙️ Плавная волна — AI зафиксировал безопасную точку входа.",
      "📉 Колебания минимальны, прогноз — до 1.5x.",
      "🛡️ Высокая точность на коротком отрезке — ставка под контролем.",
      "📈 Данные подтверждают, что коэффициент не превысит 1.6x.",
      "🔎 ИИ обнаружил предсказуемое движение — отличный момент для аккуратной ставки.",
      "🎯 Прогноз стабилен, импульс невысокий — идеален для спокойной игры."
    ],
    "medium": [  // 1.6–2x (20%)
      "🧬 AI засёк ростовой паттерн — коэффициент может достичь 2x.",
      "📡 Уверенный сигнал на подъём — граница 1.9x вполне достижима.",
      "📈 Всплеск вероятен — рекомендую контролировать ставку до 2x.",
      "🔍 Совпадение с предыдущей волной — коэффициент 1.7–1.9x на горизонте."
    ],
    "high": [  // 1.9–4x (20%)
      "⚠️ AI предсказал редкий отклоняющийся сигнал — возможен рост до 4x.",
      "🚀 Анализ указывает на сильный импульс — шанс до 3.5x.",
      "💥 Вероятность пикового роста увеличивается — момент может быть ключевым."
    ]
  },
  '70-85': {
    "low": [  // 1.1–1.7x (85%)
      "🧠 Высочайшая точность — ИИ гарантирует прогноз в пределах 1.7x.",
      "🎯 Данные подтверждают стабильный рост — ставка под контролем.",
      "📈 Уверенное движение вверх — идеально для уверенного входа.",
      "🛡️ ИИ в полной уверенности — коэффициент до 1.6x.",
      "📊 Расчёты сошлись — движение не выйдет за пределы 1.7x.",
      "📎 Исторический паттерн полностью совпал — уверенная точка входа.",
      "🎯 Прогноз приближен к идеальному — риск минимальный.",
      "📡 Модель отработала сценарий на 95% — ставка без сюрпризов.",
      "🔐 Всё под контролем — прогноз направлен в точку максимальной предсказуемости."
    ],
    "medium": [  // 1.8–2x (10%)
      "🔍 AI фиксирует всплеск — возможен коэффициент до 2x.",
      "📈 Прогноз обоснован — редкое окно до 1.9x открыто.",
      "💡 Вспышка активности зафиксирована — ставка разумна в пределах 2x."
    ],
    "high": [  // 2–2.5x (5%)
      "⚡ Исключительный случай — коэффициент до 2.5x подтверждён AI.",
      "🚀 Уникальный паттерн выявлен — шанс на взлёт повышен.",
      "💥 AI дал сигнал на пиковую точку — используй этот шанс."
    ]
  }
};

// French translations for prediction messages
const predictionMessagesFR = {
  '30-50': {
    "low": [  // 1.1–1.3x (40%)
      "📡 L'IA a calculé une faible activité — prévision fiable pour un vol court.",
      "📉 Le graphique est instable — mais je prédis une ascension minimale.",
      "🧠 L'IA a détecté une compression du signal — prévision limitée mais précise.",
      "🚦 La probabilité d'un vol au-dessus de 1.3x est très faible, prévision confirmée.",
      "⚙️ L'historique des tours indique une chute imminente — point d'entrée défini.",
      "📊 Mouvement dans les limites normales — je recommande de ne pas prendre de risques.",
      "🟢 Baisse d'activité confirmée — j'ai enregistré une probabilité inférieure à la moyenne.",
      "🎯 Risque minimal — basé sur l'analyse, la prévision est limitée mais précise."
    ],
    "medium": [  // 2–5x (30%)
      "🔍 Motif fiable détecté — chance d'attraper jusqu'à 5x.",
      "📈 Je vois des signaux de croissance — coefficient 3.2x possible.",
      "🧩 Les statistiques indiquent une zone stable — prévision dans la limite de 4x.",
      "🚀 La vague s'intensifie — un coefficient de 2x est réaliste.",
      "🛠️ L'IA a calculé une fenêtre stable — peut décoller.",
      "📎 Synchronisation avec le pic précédent — prédiction justifiée.",
      "🔁 La trajectoire se répète — chance jusqu'à 5x justifiée par les calculs."
    ],
    "high": [  // 5–10x (30%)
      "🔥 Anomalie détectée — forte hausse possible jusqu'à 7x.",
      "🌊 Le graphique reproduit le modèle avant le record précédent — potentiel élevé.",
      "🎲 Impulsion rare — l'IA prédit un saut au-dessus de 6x.",
      "🧠 L'intelligence artificielle a détecté un point critique — moment de force.",
      "📡 Avertissement: chance à 9x, mais la prédiction nécessite un calibrage plus précis."
    ]
  },
  '50-70': {
    "low": [  // 1.1–1.6x (60%)
      "🧠 Le modèle prédit une croissance stable jusqu'à 1.6x — risque minimal.",
      "📊 Le graphique montre une activité faible mais stable.",
      "⚙️ Vague douce — l'IA a enregistré un point d'entrée sûr.",
      "📉 Fluctuations minimales, prévision — jusqu'à 1.5x.",
      "🛡️ Haute précision sur un court segment — mise sous contrôle.",
      "📈 Les données confirment que le coefficient ne dépassera pas 1.6x.",
      "🔎 L'IA a détecté un mouvement prévisible — excellent moment pour une mise prudente.",
      "🎯 Prévision stable, impulsion faible — idéale pour un jeu tranquille."
    ],
    "medium": [  // 1.6–2x (20%)
      "🧬 L'IA a détecté un modèle de croissance — le coefficient peut atteindre 2x.",
      "📡 Signal fort pour une montée — la limite de 1.9x est tout à fait atteignable.",
      "📈 Pic probable — je recommande de contrôler la mise jusqu'à 2x.",
      "🔍 Concordance avec la vague précédente — coefficient 1.7-1.9x à l'horizon."
    ],
    "high": [  // 1.9–4x (20%)
      "⚠️ L'IA a prédit un signal déviant rare — croissance possible jusqu'à 4x.",
      "🚀 L'analyse indique une forte impulsion — chance jusqu'à 3.5x.",
      "💥 La probabilité d'une croissance maximale augmente — le moment peut être crucial."
    ]
  },
  '70-85': {
    "low": [  // 1.1–1.7x (85%)
      "🧠 Précision maximale — l'IA garantit une prévision dans la limite de 1.7x.",
      "🎯 Les données confirment une croissance stable — mise sous contrôle.",
      "📈 Mouvement ascendant confiant — idéal pour une entrée assurée.",
      "🛡️ L'IA est pleinement confiante — coefficient jusqu'à 1.6x.",
      "📊 Les calculs concordent — le mouvement ne dépassera pas 1.7x.",
      "📎 Le modèle historique correspond parfaitement — point d'entrée fiable.",
      "🎯 Prévision proche de la perfection — risque minimal.",
      "📡 Le modèle a simulé le scénario à 95% — mise sans surprises.",
      "🔐 Tout est sous contrôle — prévision dirigée vers le point de prévisibilité maximale."
    ],
    "medium": [  // 1.8–2x (10%)
      "🔍 L'IA détecte un pic — coefficient possible jusqu'à 2x.",
      "📈 Prévision justifiée — fenêtre rare jusqu'à 1.9x ouverte.",
      "💡 Pic d'activité enregistré — mise raisonnable dans la limite de 2x."
    ],
    "high": [  // 2–2.5x (5%)
      "⚡ Cas exceptionnel — coefficient jusqu'à 2.5x confirmé par l'IA.",
      "🚀 Modèle unique identifié — chance de décollage augmentée.",
      "💥 L'IA a donné un signal pour un point culminant — saisissez cette chance."
    ]
  }
};

// Arabic translations for prediction messages
const predictionMessagesAR = {
  '30-50': {
    "low": [
      "📡 حسب الذكاء الاصطناعي النشاط ضعيف — توقع موثوق لرحلة قصيرة.",
      "📉 الرسم البياني غير مستقر حاليًا — لكنني أتوقع ارتفاعًا بالحد الأدنى.",
      "🧠 رصد الذكاء الاصطناعي ضغط الإشارة — التوقع محدود ولكنه دقيق.",
      "🚦 احتمالية الطيران فوق 1.3x ضئيلة للغاية، التوقع مؤكد.",
      "⚙️ تاريخ الجولات يشير إلى هبوط وشيك — نقطة الدخول محددة.",
      "📊 الحركة ضمن الحدود الطبيعية — أنصح بعدم المخاطرة.",
      "🟢 انخفاض مؤكد في النشاط — سجلت فرصة أقل من المتوسط.",
      "🎯 المخاطرة بالحد الأدنى — بناءً على التحليل، التوقع محدود لكنه دقيق."
    ],
    "medium": [  // 2–5x (30%)
      "🔍 تم اكتشاف نمط موثوق — فرصة للوصول إلى 5x.",
      "📈 أرى إشارات نمو — معامل 3.2x محتمل.",
      "  الإحصاءات تشير إلى منطقة مستقرة — توقع في حدود 4x.",
      "🚀 الموجة تتصاعد — معامل بداية من 2x واقعي.",
      "🛠️ حسب الذكاء الاصطناعي نافذة مستقرة — يمكن أن ينطلق.",
      "📎 مزامنة مع الذروة السابقة — التنبؤ له ما يبرره.",
      "🔁 المسار يتكرر — الفرصة حتى 5x مبررة بالحسابات."
    ],
    "high": [  // 5–10x (30%)
      "🔥 تم الكشف عن شذوذ — ارتفاع قوي محتمل حتى 7x.",
      "🌊 الرسم البياني يكرر النموذج قبل الرقم القياسي السابق — إمكانات عالية.",
      "🎲 نبضة نادرة — يتنبأ الذكاء الاصطناعي بقفزة فوق 6x.",
      "🧠 رصد الذكاء الاصطناعي نقطة حرجة — لحظة قوة.",
      "📡 تحذير: فرصة عند 9x، لكن التنبؤ يتطلب معايرة أكثر دقة."
    ]
  },
  '50-70': {
    "low": [  // 1.1–1.6x (60%)
      "🧠 يتنبأ النموذج بنمو مستقر حتى 1.6x — المخاطرة بالحد الأدنى.",
      "📊 يُظهر الرسم البياني نشاطًا ضعيفًا ولكن مستقرًا.",
      "⚙️ موجة سلسة — سجل الذكاء الاصطناعي نقطة دخول آمنة.",
      "📉 التقلبات بالحد الأدنى، التوقع — حتى 1.5x.",
      "🛡️ دقة عالية على قطعة قصيرة — الرهان تحت السيطرة.",
      "📈 تؤكد البيانات أن المعامل لن يتجاوز 1.6x.",
      "🔎 اكتشف الذكاء الاصطناعي حركة يمكن التنبؤ بها — لحظة ممتازة لرهان حذر.",
      "🎯 توقع مستقر، نبضة منخفضة — مثالي للعب الهادئ."
    ],
    "medium": [  // 1.6–2x (20%)
      "🧬 رصد الذكاء الاصطناعي نمط نمو — يمكن أن يصل المعامل إلى 2x.",
      "📡 إشارة واثقة للصعود — حد 1.9x يمكن الوصول إليه تمامًا.",
      "📈 ارتفاع محتمل — أوصي بمراقبة الرهان حتى 2x.",
      "🔍 تطابق مع الموجة السابقة — معامل 1.7-1.9x في الأفق."
    ],
    "high": [  // 1.9–4x (20%)
      "⚠️ تنبأ الذكاء الاصطناعي بإشارة منحرفة نادرة — نمو محتمل حتى 4x.",
      "🚀 يشير التحليل إلى نبضة قوية — فرصة تصل إلى 3.5x.",
      "💥 تزداد احتمالية النمو القصوى — اللحظة قد تكون حاسمة."
    ]
  },
  '70-85': {
    "low": [  // 1.1–1.7x (85%)
      "🧠 أعلى دقة — يضمن الذكاء الاصطناعي توقعًا في حدود 1.7x.",
      "🎯 تؤكد البيانات النمو المستقر — الرهان تحت السيطرة.",
      "📈 حركة صعود واثقة — مثالية للدخول المؤكد.",
      "🛡️ الذكاء الاصطناعي في ثقة كاملة — معامل يصل إلى 1.6x.",
      "📊 الحسابات متطابقة — الحركة لن تتجاوز 1.7x.",
      "📎 النمط التاريخي متطابق تمامًا — نقطة دخول موثوقة.",
      "🎯 التوقع قريب من المثالي — مخاطرة بالحد الأدنى.",
      "📡 عمل النموذج على السيناريو بنسبة 95٪ — رهان بدون مفاجآت.",
      "🔐 كل شيء تحت السيطرة — التوقع موجه إلى نقطة الإمكانية القصوى للتنبؤ."
    ],
    "medium": [  // 1.8–2x (10%)
      "🔍 يرصد الذكاء الاصطناعي ارتفاعًا — معامل محتمل يصل إلى 2x.",
      "📈 التوقع له ما يبرره — نافذة نادرة حتى 1.9x مفتوحة.",
      "💡 تم تسجيل اندلاع نشاط — الرهان معقول في حدود 2x."
    ],
    "high": [  // 2–2.5x (5%)
      "⚡ حالة استثنائية — معامل يصل إلى 2.5x مؤكد من الذكاء الاصطناعي.",
      "🚀 تم تحديد نمط فريد — فرصة الانطلاق زادت.",
      "💥 أعطى الذكاء الاصطناعي إشارة لنقطة الذروة — استغل هذه الفرصة."
    ]
  }
};

// UI text translations
const translations = {
  fr: {
    aiVisionButton: "Vision IA",
    aviatorButton: "Aviator",
    clickForPrediction: "Cliquez sur Vision IA pour prédiction",
    download: "Télécharger",
    chanceOfWinning: "Probabilité de gagner",
    howToIncreaseChance: "COMMENT AUGMENTER VOS CHANCES ?",
    howToIncreaseDesc: "Effectuez des dépôts et jouez régulièrement à Aviator pour augmenter votre potentiel de gains. Plus vous êtes actif, plus vos chances augmentent !",
    makeDeposit: "Faire un Dépôt",
    helpMe: "Aide-moi",
    fullEnergy: "Plein",
    homeFooter: "ACCUEIL",
    faqFooter: "FAQ"
  },
  ar: {
    aiVisionButton: "رؤية الذكاء الاصطناعي",
    aviatorButton: "أفياتور",
    clickForPrediction: "انقر على رؤية الذكاء الاصطناعي للحصول على التنبؤ",
    download: "تحميل",
    chanceOfWinning: "فرصة الفوز",
    howToIncreaseChance: "كيف تزيد من فرصتك؟",
    howToIncreaseDesc: "قم بالإيداع والعب أفياتور بانتظام لزيادة إمكانية الفوز. كلما كنت أكثر نشاطًا، زادت فرصك!",
    makeDeposit: "إيداع",
    helpMe: "مساعدة",
    fullEnergy: "كامل",
    homeFooter: "الرئيسية",
    faqFooter: "الأسئلة"
  }
};

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
      // Исключаем генерацию значений в диапазоне 1.3-2.0
      const rand = Math.random();
      if (rand < 0.4) {
        // Low: 1.1-1.3x (40%)
        value = +(Math.random() * (1.3 - 1.1) + 1.1).toFixed(2);
      } else if (rand < 0.7) {
        // Medium: 2-5x (30%) - ничего в промежутке 1.3-2.0
        value = +(Math.random() * (5 - 2.0) + 2.0).toFixed(2);
      } else {
        // High: 5-10x (30%)
        value = +(Math.random() * (10 - 5.0) + 5.0).toFixed(2);
      }
    } else if (range === '50-70') {
      // Для 50-70%: нет пробелов в диапазонах, но проблема с перекрытием
      // 1.6-2.0 (medium) и 1.9-4.0 (high) перекрываются
      const rand = Math.random();
      if (rand < 0.6) {
        // Low: 1.1-1.6x (60%)
        value = +(Math.random() * (1.6 - 1.1) + 1.1).toFixed(2);
      } else if (rand < 0.8) {
        // Medium: 1.6-1.9x (20%) - избегаем перекрытия с high
        value = +(Math.random() * (1.9 - 1.6) + 1.6).toFixed(2);
      } else {
        // High: 1.9-4x (20%)
        value = +(Math.random() * (4.0 - 1.9) + 1.9).toFixed(2);
      }
    } else if (range === '70-85') {
      // Для 70-85%: проверяем отсутствие пробелов
      const rand = Math.random();
      if (rand < 0.85) {
        // Low: 1.1-1.7x (85%)
        value = +(Math.random() * (1.7 - 1.1) + 1.1).toFixed(2);
      } else if (rand < 0.95) {
        // Medium: 1.8-2.0x (10%) - с учетом размера шага
        value = +(Math.random() * (2.0 - 1.8) + 1.8).toFixed(2);
      } else {
        // High: 2.0-2.5x (5%)
        value = +(Math.random() * (2.5 - 2.0) + 2.0).toFixed(2);
      }
    }
    
    // Исключаем нежелательные пограничные значения и нули
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
  // Определяем категорию шанса
  const range = getRangeByChance(chance);
  
  if (range === '30-50') {
    // Для шанса 30-50%
    if (coefficient <= 1.3) return '#52c41a'; // Зеленый для low (1.1-1.3x) - 40%
    if (coefficient < 5.0) return '#faad14'; // Желтый для medium (2-5x) - 30%
    return '#ff4d4f'; // Красный для high (5-10x) - 30%
  } 
  else if (range === '50-70') {
    // Для шанса 50-70%
    if (coefficient <= 1.6) return '#52c41a'; // Зеленый для low (1.1-1.6x) - 60%
    if (coefficient < 1.9) return '#faad14'; // Желтый для medium (1.6-1.9x) - 20%
    return '#ff4d4f'; // Красный для high (1.9-4x) - 20%
  } 
  else if (range === '70-85') {
    // Для шанса 70-85%
    if (coefficient <= 1.7) return '#52c41a'; // Зеленый для low (1.1-1.7x) - 85%
    if (coefficient <= 2.0) return '#faad14'; // Желтый для medium (1.8-2.0x) - 10%
    return '#ff4d4f'; // Красный для high (2.0-2.5x) - 5%
  }
  
  // Для других случаев (default)
  return '#ffe066'; // Желтый по умолчанию
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
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<'fr' | 'ar'>('fr');

  // PWA installation logic
  useEffect(() => {
    console.log('PWA installation effect running');
    // Check if we're in standalone mode (already installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone || 
                         document.referrer.includes('android-app://');
    
    console.log('PWA isStandalone check:', isStandalone);
    
    if (isStandalone) {
      console.log('App is running in standalone mode (installed as PWA)');
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
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    
    // Hide the install button
    setShowInstallButton(false);
  };

  // Check authentication state and update energy
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
          
          // Если last_login_date не сегодня, начисляем +1 энергии
          if (lastLogin !== today) {
            console.log('AUTH CHECK: Last login date is not today, updating energy');
            const newEnergy = Math.min((data.energy || 0) + 1, data.max_energy || 100);
            
            // Обновляем данные в базе
            if (supabaseClient) {
              await supabaseClient
                .from('users')
                .update({ energy: newEnergy, last_login_date: today })
                .eq('mb_id', data.mb_id);
            } else {
              console.error('Supabase client is not available, cannot update energy');
            }
            
            // Обновляем локальные данные
            data.energy = newEnergy;
            data.last_login_date = today;
          }
          
          // Обновляем состояние
          console.log('AUTH CHECK: Updating state with fresh data from Supabase');
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
          setEnergy(data.energy || 0);
          setMaxEnergy(data.max_energy || 100);
          setLastLoginDate(data.last_login_date);
          setChance(data.chance || 0);
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
          if (supabaseClient) {
            supabaseClient.from('users').update({ last_login_date: today }).eq('mb_id', user.mb_id);
          } else {
            console.error('Supabase client is not available, cannot update last_login_date');
          }
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
      return selectedLang === 'fr' ? "Prévision formée" : 
             selectedLang === 'ar' ? "تم تشكيل التوقع" : "Прогноз сформирован";
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
    console.log(`Выбрана подкатегория: ${subcategory} для коэффициента ${coefficient} и шанса ${chance}`);
    console.log(`Диапазон шанса: ${range}, процент: ${chance}%, коэффициент: ${coefficient}x`);
    
    // Select the message collection based on the selected language
    let messageCollection;
    if (selectedLang === 'fr') {
      messageCollection = predictionMessagesFR;
    } else if (selectedLang === 'ar') {
      messageCollection = predictionMessagesAR;
    } else {
      messageCollection = predictionMessages;
    }
    
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
        throw new Error('База данных недоступна. Попробуйте перезагрузить страницу.');
      }
      
      // Уменьшаем энергию на 1
      const newEnergy = energy - 1;
      
      // Сначала обновляем локальное состояние
      setEnergy(newEnergy);
      
      // Обновляем только energy в базе данных
      if (!supabaseClient) {
        console.error('Supabase client is not available, cannot update energy');
        throw new Error('База данных недоступна. Попробуйте перезагрузить страницу.');
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
        console.log('Энергия уменьшена:', energy, '->', newEnergy);
      }

      // Simulate loading for 3 seconds
      setTimeout(() => {
        setIsLoading(false);
        let newCoefficient = getUniqueCoefficient(chance);
        console.log(`Сгенерирован начальный коэффициент: ${newCoefficient}`);
        
        // Проверка на попадание в запрещенные диапазоны
        const range = getRangeByChance(chance);
        if (range === '30-50') {
          // Проверяем, не попал ли коэффициент в запрещенный диапазон 1.3-2.0
          if (newCoefficient > 1.3 && newCoefficient < 2.0) {
            console.warn(`Обнаружен коэффициент ${newCoefficient} в запрещенном диапазоне 1.3-2.0. Корректируем...`);
            // Принудительно выбираем ближайшую границу
            newCoefficient = (newCoefficient - 1.3 < 2.0 - newCoefficient) ? 1.3 : 2.0;
            console.log(`Коэффициент скорректирован на: ${newCoefficient}`);
          }
        } else if (range === '70-85') {
          // Для 70-85% проверяем пробел между low и medium (1.7-1.8)
          if (newCoefficient > 1.7 && newCoefficient < 1.8) {
            console.warn(`Обнаружен коэффициент ${newCoefficient} в запрещенном диапазоне 1.7-1.8. Корректируем...`);
            newCoefficient = (newCoefficient - 1.7 < 1.8 - newCoefficient) ? 1.7 : 1.8;
            console.log(`Коэффициент скорректирован на: ${newCoefficient}`);
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
            Проверка авторизации...
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
            Перейти к авторизации
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
            Ошибка подключения
          </h2>
          <p style={{ color: '#ff9999', fontSize: 16, textAlign: 'center', lineHeight: 1.5 }}>
            {supabaseError}
          </p>
          <p style={{ color: '#7ecbff', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            Пожалуйста, проверьте интернет-соединение и попробуйте перезагрузить страницу.
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
            Перезагрузить
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
              {selectedLang === 'fr' ? translations.fr.download : 
               selectedLang === 'ar' ? translations.ar.download : 
               "Download"}
            </button>
          )}
          {/* Language Switcher */}
          <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
            <button
              onClick={() => setSelectedLang('fr')}
              style={{
                background: selectedLang === 'fr' ? '#38e0ff' : 'none',
                color: selectedLang === 'fr' ? '#07101e' : '#38e0ff',
                border: '1px solid #38e0ff',
                borderRadius: 8,
                padding: '6px 16px',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              FR
            </button>
            <button
              onClick={() => setSelectedLang('ar')}
              style={{
                background: selectedLang === 'ar' ? '#38e0ff' : 'none',
                color: selectedLang === 'ar' ? '#07101e' : '#38e0ff',
                border: '1px solid #38e0ff',
                borderRadius: 8,
                padding: '6px 16px',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              AR
            </button>
          </div>
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
                    animation: 'fadeIn 0.5s',
                    direction: selectedLang === 'ar' ? 'rtl' : 'ltr'
                  }}>
                    <div style={{ 
                      fontSize: 28, 
                      marginBottom: 10, 
                      fontWeight: 500, 
                      color: getCoeffColor(coefficient, chance), 
                      textShadow: `0 0 3px ${getCoeffColor(coefficient, chance)}66`
                    }}>
                      {coefficient.toFixed(2)}x
                    </div>
                    <div style={{ 
                      fontSize: 16, 
                      marginTop: 15, 
                      color: '#7ecbff', 
                      textShadow: '0 0 4px #7ecbff66',
                      textAlign: selectedLang === 'ar' ? 'right' : 'center',
                      width: '90%',
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
                      direction: selectedLang === 'ar' ? 'rtl' : 'ltr'
                    }}>
                    {selectedLang === 'fr' ? translations.fr.clickForPrediction : 
                     selectedLang === 'ar' ? translations.ar.clickForPrediction : 
                     "Click AI Vision for prediction"}
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
                    direction: selectedLang === 'ar' ? 'rtl' : 'ltr'
                  }}
                  onMouseOver={e => {
                    if (!(isLoading || energy <= 0)) e.currentTarget.style.boxShadow = '0 0 24px #ffe066cc';
                  }}
                  onMouseOut={e => {
                    if (!(isLoading || energy <= 0)) e.currentTarget.style.boxShadow = '0 0 16px #ffe06699';
                  }}
                >
                  {selectedLang === 'fr' ? translations.fr.aiVisionButton : 
                   selectedLang === 'ar' ? translations.ar.aiVisionButton : 
                   "AI Vision"}
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
                    direction: selectedLang === 'ar' ? 'rtl' : 'ltr'
                  }}
                  onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 24px #ff7875cc'; }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 16px #ff4d4f99'; }}
                >
                  {selectedLang === 'fr' ? translations.fr.aviatorButton : 
                   selectedLang === 'ar' ? translations.ar.aviatorButton : 
                   "Aviator"}
                </button>
              </div>
              {/* ЭНЕРГИЯ */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: 38,
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
                      <span>{selectedLang === 'fr' ? translations.fr.fullEnergy : 
                             selectedLang === 'ar' ? translations.ar.fullEnergy : 
                             "Full"}</span>
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
                        padding: '18px 16px',
                        marginTop: 4,
                        marginBottom: 4,
                        textAlign: 'center',
                        position: 'relative',
                        width: '100%',
                      }}>
                        <div style={{
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 18,
                          marginBottom: 6,
                          textShadow: '0 0 8px #7ecbff99',
                          fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
                        }}>
                          {selectedLang === 'fr' ? translations.fr.chanceOfWinning : 
                           selectedLang === 'ar' ? translations.ar.chanceOfWinning : 
                           "Chance of winning"}
                        </div>
                        <div style={{
                          fontSize: 36,
                          fontWeight: 500,
                          color: chanceColor,
                          textShadow: `0 0 6px ${chanceColor}55`,
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
                        marginTop: 2,
                        marginBottom: 4,
                        width: '100%',
                      }}>
                        <div style={{
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: 600,
                          marginBottom: 8,
                          textAlign: 'center',
                          textShadow: '0 0 8px #ffe06644',
                        }}>
                          {selectedLang === 'fr' ? translations.fr.howToIncreaseChance : 
                           selectedLang === 'ar' ? translations.ar.howToIncreaseChance : 
                           "HOW TO INCREASE YOUR CHANCE?"}
                        </div>
                        <div style={{
                          color: '#7ecbff',
                          fontSize: 13,
                          lineHeight: '1.5',
                          textAlign: 'center',
                          direction: selectedLang === 'ar' ? 'rtl' : 'ltr'
                        }}>
                          {selectedLang === 'fr' ? translations.fr.howToIncreaseDesc : 
                           selectedLang === 'ar' ? translations.ar.howToIncreaseDesc : 
                           "Make deposits and play Aviator regularly to increase your winning potential. The more active you are, the higher your chances become!"}
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
                            direction: selectedLang === 'ar' ? 'rtl' : 'ltr'
                          }}
                          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 24px #ff7875cc'; }}
                          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 16px #ff4d4f99'; }}
                        >
                          {selectedLang === 'fr' ? translations.fr.makeDeposit : 
                           selectedLang === 'ar' ? translations.ar.makeDeposit : 
                           "Make Deposit"}
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
                            direction: selectedLang === 'ar' ? 'rtl' : 'ltr'
                          }}
                          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 24px #faad14cc'; }}
                          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 16px #faad1499'; }}
                        >
                          {selectedLang === 'fr' ? translations.fr.helpMe : 
                           selectedLang === 'ar' ? translations.ar.helpMe : 
                           "Help Me"}
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
      <Footer selectedLang={selectedLang} translations={translations} />
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
            padding: 18px 4vw 12px 4vw !important;
            gap: 12px !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            margin-top: 20px !important;
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
            padding: 0 4vw 100px 4vw !important;
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
            margin: 4px 0 !important;
          }
          main > div > div > div > div[style*='display: flex'][style*='gap: 12px'] button {
            font-size: 13px !important;
            padding: 8px 0 !important;
            border-radius: 5px !important;
          }
          /* Энергия */
          main > div > div > div > div[style*='position: relative'][style*='width: 100%'] {
            margin: 2px 0 !important;
          }
          /* Шанс и инфо-блок */
          main > div > div > div > div[style*='textAlign: center'] {
            margin: 2px 0 !important;
            padding: 6px !important;
            border-width: 1px !important;
          }
          main > div > div > div > div[style*='textAlign: center'] div {
            font-size: 10px !important;
            margin-bottom: 2px !important;
          }
          main > div > div > div > div[style*='textAlign: center'] div + div {
            font-size: 14px !important;
            margin-bottom: 2px !important;
          }
          main > div > div > div > div[style*='textAlign: center'] div + div + div {
            height: 4px !important;
            border-radius: 2px !important;
          }
          main > div > div > div > div[style*='textAlign: center'] div + div + div div {
            border-radius: 2px !important;
          }
          main > div > div > div > div:last-child {
            margin: 1px 0 2px 0 !important;
            padding: 12px !important;
          }
          .ai-prediction-hint {
            font-size: 18px !important;
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
