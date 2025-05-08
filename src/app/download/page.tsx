'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import font from '../../../public/go.jpg';

export default function DownloadPage() {
  const [selectedLang, setSelectedLang] = useState<'fr' | 'ar'>('fr');
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwa, setIsPwa] = useState(false);
  const router = useRouter();
  
  // UI text translations
  const translations = {
    fr: {
      title: "Kashif AI",
      aviatorPredictor: "Prédicteur Aviator",
      aiPowered: "Propulsé par l'intelligence artificielle",
      downloadApp: "Télécharger",
    },
    ar: {
      title: "كاشف AI",
      aviatorPredictor: "متنبئ أفياتور",
      aiPowered: "مدعوم بالذكاء الاصطناعي",
      downloadApp: "تحميل",
    }
  };

  // Check if running in PWA mode and redirect if needed
  useEffect(() => {
    const checkIfPwa = () => {
      // Multiple ways to check for standalone mode
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true || // iOS
        document.referrer.includes('android-app://') ||
        window.location.href.includes('mode=standalone');

      setIsPwa(isStandalone);
      
      // Store standalone mode in sessionStorage for middleware to check
      if (isStandalone) {
        try {
          sessionStorage.setItem('isPwa', 'true');
          localStorage.setItem('isPwa', 'true');
          
          // If in PWA mode, redirect to the auth page
          router.push('/auth');
        } catch (e) {
          console.error('Error storing PWA state:', e);
        }
      }
    };
    
    checkIfPwa();
    
    // Listen for display mode changes
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsPwa(e.matches);
      if (e.matches) {
        sessionStorage.setItem('isPwa', 'true');
        localStorage.setItem('isPwa', 'true');
        router.push('/auth');
      }
    };
    
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(handleChange);
    }
    
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQueryList.removeListener(handleChange);
      }
    };
  }, [router]);

  // PWA installation logic
  useEffect(() => {
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

    // Check if the app is already installed
    window.addEventListener('appinstalled', () => {
      console.log('App installed event triggered');
      setShowInstallButton(false);
      
      // Set PWA status after installation
      sessionStorage.setItem('isPwa', 'true');
      localStorage.setItem('isPwa', 'true');
      
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
    if (!deferredPrompt) {
      console.log('No installation prompt available');
      // Fallback for when prompt is not available
      window.dispatchEvent(new Event('beforeinstallprompt'));
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the installation prompt: ${outcome}`);
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    
    // Hide the install button
    setShowInstallButton(false);
  };

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