'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import font from '../../../public/go.jpg';

// Function to reliably detect PWA mode
function getPWADisplayMode() {
  if (typeof window === 'undefined') return 'browser';
  
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (document.referrer.startsWith('android-app://')) {
    return 'twa';
  } else if ((window.navigator as any).standalone || isStandalone) {
    return 'standalone';
  }
  return 'browser';
}

export default function DownloadPage() {
  const [selectedLang, setSelectedLang] = useState<'fr' | 'ar'>('fr');
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwa, setIsPwa] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [displayMode, setDisplayMode] = useState<string>('browser');
  const router = useRouter();
  
  // UI text translations
  const translations = {
    fr: {
      title: "Kashif AI",
      aviatorPredictor: "Prédicteur Aviator",
      aiPowered: "Propulsé par l'intelligence artificielle",
      downloadApp: "Télécharger",
      redirecting: "Redirection..."
    },
    ar: {
      title: "كاشف AI",
      aviatorPredictor: "متنبئ أفياتور",
      aiPowered: "مدعوم بالذكاء الاصطناعي",
      downloadApp: "تحميل",
      redirecting: "جارٍ إعادة التوجيه..."
    }
  };

  // Immediate check for PWA mode on component mount
  useEffect(() => {
    // Force client-side execution only
    if (typeof window === 'undefined') return;
    
    const detectPWAAndRedirect = () => {
      const mode = getPWADisplayMode();
      setDisplayMode(mode);
      console.log('PWA detection result:', mode);
      
      // Consider the app to be a PWA if it's in standalone or TWA mode
      const isPwaMode = mode === 'standalone' || mode === 'twa';
      setIsPwa(isPwaMode);
      
      // Additional fallback checks for PWA mode
      const storedPwaStatus = localStorage.getItem('isPwa') === 'true' || 
                              sessionStorage.getItem('isPwa') === 'true';
      
      console.log('PWA detection details:', {
        displayMode: mode,
        isPwaMode,
        storedPwaStatus,
        navigatorStandalone: (window.navigator as any).standalone,
        matchMedia: window.matchMedia('(display-mode: standalone)').matches,
        referrer: document.referrer
      });
      
      // If it's a PWA or we previously determined it's a PWA
      if (isPwaMode || storedPwaStatus) {
        setIsRedirecting(true);
        
        // Store the PWA state in multiple places
        try {
          localStorage.setItem('isPwa', 'true');
          sessionStorage.setItem('isPwa', 'true');
          document.cookie = 'isPwa=true; path=/; max-age=31536000; SameSite=Strict';
          
          // Force redirect to auth page in most cases
          console.log('PWA mode detected, redirecting to auth page');
          setTimeout(() => router.push('/auth?pwa=true'), 300);
        } catch (e) {
          console.error('Error storing PWA state:', e);
        }
      }
    };
    
    // Run detection immediately and again after a short delay
    detectPWAAndRedirect();
    const fallbackCheck = setTimeout(detectPWAAndRedirect, 1000);
    
    // Also add a link click handler for additional protection against bugs
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && !link.getAttribute('href')?.startsWith('/auth')) {
        // Always set PWA flag on any navigation
        try {
          localStorage.setItem('isPwa', 'true');
          sessionStorage.setItem('isPwa', 'true');
          document.cookie = 'isPwa=true; path=/; max-age=31536000; SameSite=Strict';
        } catch (e) {
          console.error('Error setting PWA status on link click:', e);
        }
      }
    };
    
    document.addEventListener('click', handleLinkClick);
    
    return () => {
      clearTimeout(fallbackCheck);
      document.removeEventListener('click', handleLinkClick);
    };
  }, [router]);

  // PWA installation logic
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // If already in PWA mode, don't show install button
    if (isPwa) {
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

    // Try to trigger the prompt manually for Safari
    if (/iP(ad|hone|od)/.test(navigator.userAgent) && !window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(true);
    }

    // Also show install button on Android if not in standalone mode
    if (/Android/.test(navigator.userAgent) && !window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(true);
    }

    // Check if the app is already installed
    window.addEventListener('appinstalled', () => {
      console.log('App installed event triggered');
      setShowInstallButton(false);
      setIsRedirecting(true);
      
      // Set PWA status after installation
      localStorage.setItem('isPwa', 'true');
      sessionStorage.setItem('isPwa', 'true');
      document.cookie = 'isPwa=true; path=/; max-age=31536000; SameSite=Strict';
      
      // Set display mode to standalone after installation
      setDisplayMode('standalone');
      
      // Add a small delay before redirecting to ensure everything is set
      setTimeout(() => {
        router.push('/auth');
      }, 1000);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isPwa, router]);

  // Function to handle PWA installation
  const handleInstallClick = async () => {
    console.log('Install button clicked');
    
    // For iOS Safari
    if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !window.matchMedia('(display-mode: standalone)').matches) {
      alert('Для установки на iOS:\n1. Нажмите кнопку "Поделиться" (Share) внизу экрана\n2. Прокрутите вниз и выберите "На экран «Домой»" (Add to Home Screen)');
      return;
    }
    
    // For Android browsers without install API
    if (/Android/.test(navigator.userAgent) && !deferredPrompt) {
      alert('Для установки на Android:\n1. Нажмите на три точки (⋮) в правом верхнем углу\n2. Выберите "Установить приложение" или "Добавить на главный экран"');
      return;
    }

    if (!deferredPrompt) {
      console.log('No installation prompt available');
      // Показать специальное сообщение пользователю
      alert('Для установки приложения: \n1. Нажмите на кнопку меню в вашем браузере (⋮ или ···) \n2. Выберите "Установить приложение" или "Добавить на главный экран"');
      
      // Попробуем явно вызвать событие для мобильных устройств, где это может сработать
      try {
        window.dispatchEvent(new Event('beforeinstallprompt'));
      } catch (e) {
        console.error('Error dispatching beforeinstallprompt event:', e);
      }
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the installation prompt: ${outcome}`);
      
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      
      // Hide the install button
      setShowInstallButton(false);
      
      if (outcome === 'accepted') {
        setIsRedirecting(true);
        setTimeout(() => {
          localStorage.setItem('isPwa', 'true');
          sessionStorage.setItem('isPwa', 'true');
          document.cookie = 'isPwa=true; path=/; max-age=31536000; SameSite=Strict';
        }, 500);
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
      alert('Для установки: нажмите на кнопку меню в браузере (⋮) и выберите "Установить приложение"');
    }
  };
  
  // If we're redirecting, show a loading screen
  if (isRedirecting) {
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
          alignItems: 'center',
          justifyContent: 'center',
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
            background: 'rgba(7, 16, 30, 0.85)',
            zIndex: 1,
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
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
          <div style={{ 
            color: '#38e0ff', 
            fontSize: 18,
            fontWeight: 600,
            textAlign: 'center'
          }}>
            {selectedLang === 'fr' ? translations.fr.redirecting : translations.ar.redirecting}
          </div>
          <div style={{
            color: '#7ecbff',
            fontSize: 14,
            marginTop: 10,
            opacity: 0.8
          }}>
            Display mode: {displayMode}
          </div>
        </div>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
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
          background: 'rgba(7, 16, 30, 0.75)',
          zIndex: 1,
        }}
      />
      
      {/* Маленькая кнопка для перехода в приложение для тех, кто уже установил PWA */}
      <button
        onClick={() => {
          localStorage.setItem('isPwa', 'true');
          sessionStorage.setItem('isPwa', 'true');
          document.cookie = 'isPwa=true; path=/; max-age=31536000; SameSite=Strict';
          router.push('/auth?pwa=true');
        }}
        style={{
          position: 'absolute',
          top: 15,
          right: 15,
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.3)',
          fontSize: 20,
          cursor: 'pointer',
          padding: 5,
          zIndex: 10
        }}
        aria-label="Уже установлено"
      >
        ⟳
      </button>
      
      {/* HEADER */}
      <header
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
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
            marginBottom: 15,
          }}
        >
          {selectedLang === 'fr' ? translations.fr.title : translations.ar.title}
        </div>
        
        {/* Language Switcher */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
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
            عربي
          </button>
        </div>

        {/* Download Button in Header */}
        <button
          onClick={handleInstallClick}
          style={{
            padding: '12px 28px',
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(90deg, #ffe066 0%, #ffb300 100%)',
            color: '#07101e',
            fontWeight: 700,
            fontSize: 16,
            boxShadow: '0 0 15px rgba(255, 224, 102, 0.6)',
            cursor: 'pointer',
            fontFamily: 'Orbitron, Segoe UI, Arial, sans-serif',
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: 10,
          }}
          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 224, 102, 0.8)'; }}
          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 224, 102, 0.6)'; }}
        >
          {selectedLang === 'fr' ? translations.fr.downloadApp : translations.ar.downloadApp}
        </button>
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
          padding: '20px 5vw 40px 5vw',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* App Content */}
        <div
          style={{
            width: '100%',
            maxWidth: 550,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
          }}
        >
          {/* App Logo & Title */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 30,
          }}>
            {/* App Logo Circle */}
            <div style={{
              width: 120,
              height: 120,
              background: '#38e0ff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(56, 224, 255, 0.6)',
              marginBottom: 25,
            }}>
              <span style={{ 
                fontSize: 60, 
                color: '#fff',
                textShadow: '0 0 5px rgba(255, 255, 255, 0.8)'
              }}>✈️</span>
            </div>
            
            {/* App Title */}
            <h1 style={{ 
              color: '#fff',
              fontSize: 36,
              fontWeight: 700,
              textAlign: 'center',
              margin: 0,
              textShadow: '0 0 10px rgba(56, 224, 255, 0.8)',
              marginBottom: 10,
              fontFamily: "'Orbitron', sans-serif",
            }}>
              {selectedLang === 'fr' ? translations.fr.aviatorPredictor : translations.ar.aviatorPredictor}
            </h1>
            
            {/* Subtitle */}
            <p style={{ 
              color: '#38e0ff',
              fontSize: 18,
              textAlign: 'center',
              margin: 0,
              direction: selectedLang === 'ar' ? 'rtl' : 'ltr',
              fontFamily: "'montserrat', sans-serif",
            }}>
              {selectedLang === 'fr' ? translations.fr.aiPowered : translations.ar.aiPowered}
            </p>
          </div>
          
          {/* App Demo Container */}
          <div style={{
            width: '100%',
            maxWidth: 500,
            borderRadius: 20,
            background: 'rgba(10, 26, 47, 0.8)',
            border: '2px solid #38e0ff',
            boxShadow: '0 0 20px rgba(56, 224, 255, 0.4)',
            padding: 20,
            marginBottom: 30,
          }}>
            {/* App Screenshot */}
            <div style={{
              position: 'relative',
              width: '100%',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
              marginBottom: 25,
            }}>
              {/* Title in the app screenshot */}
              <div style={{
                width: '100%',
                padding: '15px 0',
                textAlign: 'center',
                background: '#0a1a2f',
              }}>
                <span style={{
                  color: '#fff',
                  fontSize: 22,
                  fontWeight: 'bold',
                }}>
                  Kashif AI
                </span>
              </div>
              
              {/* App Preview */}
              <div style={{
                background: 'rgba(10, 26, 47, 0.9)',
                padding: '20px 15px',
              }}>
                {/* Coefficient Display */}
                <div style={{
                  width: '100%',
                  textAlign: 'center',
                  margin: '15px 0 25px 0',
                }}>
                  <span style={{
                    color: '#ffe066',
                    fontSize: 42,
                    fontWeight: 'bold',
                    textShadow: '0 0 10px rgba(255, 224, 102, 0.4)',
                  }}>
                    2.41x
                  </span>
                </div>
                
                {/* App Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 15,
                  marginBottom: 20,
                }}>
                  <div style={{
                    padding: '8px 18px',
                    background: '#ffe066',
                    color: '#07101e',
                    borderRadius: 8,
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}>
                    AI Vision
                  </div>
                  <div style={{
                    padding: '8px 18px',
                    background: '#ff4d4f',
                    color: '#fff',
                    borderRadius: 8,
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}>
                    Aviator
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature List */}
            <div style={{
              width: '100%',
              padding: '0 10px',
              direction: selectedLang === 'ar' ? 'rtl' : 'ltr',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}>
                <span style={{ color: '#ffe066', fontSize: 18 }}>✓</span>
                <span style={{ color: '#fff', fontSize: 16 }}>
                  {selectedLang === 'fr' ? "Prédictions précises des coefficients" : "تنبؤات دقيقة للمعاملات"}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}>
                <span style={{ color: '#ffe066', fontSize: 18 }}>✓</span>
                <span style={{ color: '#fff', fontSize: 16 }}>
                  {selectedLang === 'fr' ? "Algorithme IA avancé" : "خوارزمية ذكاء اصطناعي متقدمة"}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{ color: '#ffe066', fontSize: 18 }}>✓</span>
                <span style={{ color: '#fff', fontSize: 16 }}>
                  {selectedLang === 'fr' ? "Augmentez vos chances de gains" : "زيادة فرصك في الفوز"}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Маленькая скрытая ссылка для мануального перехода в случае проблем */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <a 
            href="/auth?pwa=true" 
            style={{ 
              color: 'rgba(255,255,255,0.2)', 
              fontSize: 10, 
              textDecoration: 'none',
              cursor: 'default'
            }}
            onClick={(e) => {
              e.preventDefault();
              // Установить все флаги PWA
              localStorage.setItem('isPwa', 'true');
              sessionStorage.setItem('isPwa', 'true');
              document.cookie = 'isPwa=true; path=/; max-age=31536000; SameSite=Strict';
              // Перенаправить на страницу auth
              router.push('/auth?pwa=true');
            }}
          >
            v1.0.0
          </a>
        </div>
      </main>

      {/* Responsive Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');
        
        @media (max-width: 600px) {
          header {
            padding: 20px 4vw 12px 4vw !important;
          }
          
          header > div:first-child {
            font-size: 26px !important;
            margin-bottom: 12px !important;
          }
          
          header > div:nth-child(2) {
            margin-bottom: 15px !important;
          }
          
          header button {
            font-size: 12px !important;
            padding: 4px 12px !important;
          }
          
          header > button {
            padding: 10px 20px !important;
            font-size: 14px !important;
          }
          
          main {
            padding: 0 4vw 40px 4vw !important;
          }
          
          main h1 {
            font-size: 28px !important;
          }
          
          main p {
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
} 