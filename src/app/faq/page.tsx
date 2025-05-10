'use client';

import React, { useState } from 'react';
import Footer from '../components/Footer';
import Image from 'next/image';
import chanceImg from '@/../public/chance.png';
import koefImg from '@/../public/koef.png';
import energyImg from '@/../public/energy.png';
import depositImg from '@/../public/deposit.png';
import aviatorImg from '@/../public/aviator.png';
import messageImg from '@/../public/message.png';

interface FAQBlock {
  title: string;
  text: string;
  image: string;
}

interface FAQContent {
  title: string;
  blocks: FAQBlock[];
}

interface FAQData {
  fr: FAQContent;
  ar: FAQContent;
}

const FAQ_CONTENT: FAQData = {
  fr: {
    title: "F.A.Q. — Questions fréquemment posées",
    blocks: [
      {
        title: "Que fait le bouton Vision IA ?",
        text: "Le bouton Vision IA lance un algorithme d'intelligence artificielle qui fait une prédiction personnalisée pour le prochain tour du jeu Aviator. Chaque prédiction comprend :\n\n💡 Un coefficient spécifique\n🧠 Une justification basée sur ce coefficient particulier\n⚠️ Un avertissement sur le niveau de risque (élevé, moyen ou sûr)\n📌 1 prédiction = 1 unité d'énergie. Utilisez-la judicieusement.",
        image: ""
      },
      {
        title: "Où s'affiche la prédiction ?",
        text: "Votre prédiction actuelle s'affiche au centre de l'écran dans la partie supérieure. Vous voyez immédiatement le coefficient, l'explication et la probabilité qu'il se réalise.",
        image: koefImg.src
      },
      {
        title: "Que fait le bouton Aviator ?",
        text: "Le bouton Aviator ouvre la section du jeu Aviator sur le site Mostbet.\n📲 Vous pouvez utiliser simultanément Kashif IA et Aviator, en basculant entre les fenêtres — c'est pratique et rapide.",
        image: aviatorImg.src
      },
      {
        title: "Comment fonctionne l'énergie ?",
        text: "⚡ Chaque jour où vous vous connectez à l'application, vous recevez 1 unité d'énergie (mise à jour toutes les 24 heures)\n🔁 1 énergie = 1 prédiction\n⛔ Si l'énergie est épuisée, vous pouvez la reconstituer par un dépôt",
        image: energyImg.src
      },
      {
        title: "Qu'est-ce que la Probabilité de gagner ?",
        text: "C'est votre pourcentage de précision de prédiction. Il :\n\n📈 Augmente automatiquement après chaque dépôt\n🔐 Est calculé par l'algorithme d'IA\n💸 Plus le pourcentage est élevé, plus votre prévision est précise et, par conséquent, vous commencez à gagner plus. L'IA commence à mieux prédire les coefficients et à vous aider à analyser les graphiques.",
        image: chanceImg.src
      },
      {
        title: "Comment fonctionne le bouton Faire un Dépôt ?",
        text: "Appuyez pour accéder à la section des dépôts. Le dépôt :\n- Augmente vos chances de prédictions précises\n- Augmente l'énergie dans le programme pour de nouveaux lancements de Vision IA",
        image: depositImg.src
      },
      {
        title: "Bouton Aide-moi",
        text: "Si vous rencontrez des problèmes ou souhaitez en savoir plus, écrivez-moi",
        image: messageImg.src
      },
      {
        title: "L'essentiel :",
        text: "- Utilisez Vision IA pour les prédictions\n- Basculez entre Kashif AI et Aviator, c'est pratique 😉\n- Surveillez votre niveau d'énergie et de précision\n- Faites des dépôts pour augmenter vos chances",
        image: ""
      }
    ]
  },
  ar: {
    title: "الأسئلة الشائعة",
    blocks: [
      {
        title: "ماذا يفعل زر رؤية الذكاء الاصطناعي؟",
        text: "يطلق زر رؤية الذكاء الاصطناعي خوارزمية ذكاء اصطناعي تقدم تنبؤًا شخصيًا للجولة التالية في لعبة Aviator. يتضمن كل تنبؤ:\n\n💡 معامل محدد واحد\n🧠 تبرير لسبب اختيار هذا المعامل بالتحديد\n⚠️ تحذير بشأن مستوى المخاطرة (عالي، متوسط، أو آمن)\n📌 تنبؤ واحد = وحدة طاقة واحدة. استخدمها بحكمة.",
        image: ""
      },
      {
        title: "أين يظهر التنبؤ؟",
        text: "يظهر تنبؤك الحالي في وسط الشاشة في الجزء العلوي. يمكنك رؤية المعامل والشرح واحتمالية تحققه على الفور.",
        image: koefImg.src
      },
      {
        title: "ماذا يفعل زر Aviator؟",
        text: "يفتح زر Aviator قسم لعبة Aviator على موقع Mostbet.\n📲 يمكنك استخدام Kashif IA و Aviator في نفس الوقت، بالتبديل بين النوافذ - إنه مريح وسريع.",
        image: aviatorImg.src
      },
      {
        title: "كيف تعمل الطاقة؟",
        text: "⚡ في كل يوم تدخل فيه إلى التطبيق، تحصل على وحدة طاقة واحدة (يتم تحديثها كل 24 ساعة)\n🔁 طاقة واحدة = تنبؤ واحد\n⛔ إذا نفدت الطاقة، يمكنك تجديدها من خلال الإيداع",
        image: energyImg.src
      },
      {
        title: "ما هي احتمالية الفوز؟",
        text: "هذه هي نسبة دقة تنبؤاتك. وهي:\n\n📈 تزداد تلقائيًا بعد كل إيداع\n🔐 تُحسب بواسطة خوارزمية الذكاء الاصطناعي\n💸 كلما زادت النسبة المئوية، كان تنبؤك أكثر دقة وبالتالي تبدأ في كسب المزيد. يبدأ الذكاء الاصطناعي في التنبؤ بشكل أفضل بالمعاملات ومساعدتك في تحليل الرسوم البيانية.",
        image: chanceImg.src
      },
      {
        title: "كيف يعمل زر الإيداع؟",
        text: "اضغط للانتقال إلى قسم الإيداع. الإيداع:\n- يزيد من فرصك في الحصول على تنبؤات دقيقة\n- يزيد الطاقة في البرنامج لإطلاقات جديدة لرؤية الذكاء الاصطناعي",
        image: depositImg.src
      },
      {
        title: "زر المساعدة",
        text: "إذا واجهت أي مشاكل أو أردت معرفة أي شيء، اكتب لي",
        image: messageImg.src
      },
      {
        title: "النقاط الرئيسية:",
        text: "- استخدم رؤية الذكاء الاصطناعي للتنبؤات\n- قم بالتبديل بين Kashif AI و Aviator، إنه مريح 😉\n- راقب مستوى الطاقة والدقة لديك\n- قم بالإيداعات لزيادة فرصك",
        image: ""
      }
    ]
  }
};

export default function FAQ() {
  const [currentLang, setCurrentLang] = useState<'fr' | 'ar'>('fr');
  const content = FAQ_CONTENT[currentLang];

  // Функция выхода
  const handleExit = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
  };

  return (
    <>
      {/* HEADER */}
      <div className="faq-header">
        <div className="header-content">
          <button className="faq-exit-btn" onClick={handleExit}>Exit</button>
          <div className="language-switcher">
            <button 
              className={`lang-btn ${currentLang === 'fr' ? 'active' : ''}`}
              onClick={() => setCurrentLang('fr')}
            >
              FR
            </button>
            <button 
              className={`lang-btn ${currentLang === 'ar' ? 'active' : ''}`}
              onClick={() => setCurrentLang('ar')}
            >
              عربي
            </button>
          </div>
        </div>
      </div>
      <div className="faq-container">
        <div className={`content-wrapper ${currentLang === 'ar' ? 'rtl' : ''}`}>
          <h1 className="main-title">{content.title}</h1>
          
          <div className="faq-blocks">
            {content.blocks.map((block, idx) => (
              <div key={idx} className="faq-block-wrapper">
                <div className="block-title-wrapper">
                  <h2 className="block-title">{block.title}</h2>
                </div>
                <div className="faq-block">
                  <div className="block-text">
                    {block.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < block.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  {block.image && (
                    <div className="image-container">
                      <Image
                        src={block.image}
                        alt={block.title}
                        width={600}
                        height={400}
                        style={{
                          borderRadius: '12px',
                          maxWidth: '100%',
                          height: 'auto'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Footer selectedLang={currentLang} translations={{
          fr: {
            homeFooter: "ACCUEIL",
            faqFooter: "FAQ"
          },
          ar: {
            homeFooter: "الرئيسية",
            faqFooter: "الأسئلة"
          }
        }} />

        <style jsx global>{`
          html, body {
            background: #07101e !important;
          }
          .faq-container {
            min-height: 100vh;
            width: 100%;
            background: #07101e;
            font-family: 'Orbitron', sans-serif;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
          }

          .faq-header {
            width: 100%;
            padding: 24px 5vw 12px 5vw;
            box-sizing: border-box;
            position: relative;
            z-index: 20;
            background: none !important;
            box-shadow: none !important;
            border: none !important;
            color: inherit !important;
          }

          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1000px;
            margin: 0 auto;
          }

          .language-switcher {
            display: flex;
            gap: 10px;
            z-index: 10;
          }

          .faq-exit-btn {
            background: none;
            color: #fff;
            font-weight: 700;
            font-size: 18px;
            border-radius: 8px;
            padding: 10px 28px;
            text-decoration: none;
            box-shadow: 0 0 8px #ff7eb955;
            letter-spacing: 1.1px;
            transition: background 0.2s, color 0.2s;
            cursor: pointer;
            font-family: 'Orbitron', Segoe UI, Arial, sans-serif;
            border: none;
            outline: none;
          }

          .lang-btn {
            background: rgba(20, 40, 70, 0.35);
            border: 1px solid #38e0ff;
            color: #38e0ff;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Orbitron', sans-serif;
            transition: all 0.3s ease;
          }

          .lang-btn.active {
            background: #38e0ff;
            color: #07101e;
          }

          .content-wrapper {
            max-width: 1000px;
            margin: 60px auto 0;
            padding: 20px;
          }

          .rtl {
            direction: rtl;
            text-align: right;
          }

          .main-title {
            color: #38e0ff;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 40px;
            text-align: center;
            text-shadow: 0 0 10px rgba(56, 224, 255, 0.5);
          }

          .faq-blocks {
            display: flex;
            flex-direction: column;
            gap: 60px;
            margin-bottom: 150px;
          }

          .faq-block-wrapper {
            position: relative;
            padding-top: 40px;
            margin-top: 20px;
          }

          .block-title-wrapper {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%) translateY(-50%);
            background: #07101e;
            padding: 0 20px;
            z-index: 2;
            width: auto;
            max-width: 90%;
            text-align: center;
            }

          .rtl .block-title-wrapper {
            direction: rtl;
          }

          .block-title {
            color: #ffe066;
            font-size: 24px;
            white-space: normal;
            word-wrap: break-word;
            text-shadow: 0 0 8px rgba(255, 224, 102, 0.5);
            margin: 0;
            line-height: 1.3;
          }

          .faq-block {
            background: rgba(20, 40, 70, 0.35);
            border: 2px solid #38e0ff;
            border-radius: 16px;
            padding: 25px 20px;
            color: white;
            box-shadow: 0 0 20px rgba(56, 224, 255, 0.15);
          }

          .block-text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 25px;
            color: #fff;
          }

          .image-container {
            width: 100%;
            display: flex;
            justify-content: center;
            margin-top: 25px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            padding: 15px;
            border: 1px solid rgba(56, 224, 255, 0.2);
          }

          @media (max-width: 768px) {
            .content-wrapper {
              padding: 15px;
              margin-top: 40px;
            }

            .main-title {
              font-size: 24px;
              margin-bottom: 30px;
            }

            .faq-blocks {
              gap: 40px;
              margin-bottom: 130px;
            }

            .block-title-wrapper {
              padding: 0 15px;
            }

            .block-title {
              font-size: 18px;
            }

            .faq-block {
              padding: 20px 15px;
            }

            .block-text {
              font-size: 14px;
              margin-bottom: 20px;
            }

            .image-container {
              padding: 10px;
            }
          }

          @media (max-width: 480px) {
            .faq-container {
              padding: 15px 10px;
            }

            .content-wrapper {
              padding: 10px;
              margin-top: 30px;
            }

            .main-title {
              font-size: 20px;
              margin-bottom: 25px;
            }

            .faq-blocks {
              margin-bottom: 120px;
            }

            .block-title {
              font-size: 16px;
            }

            .faq-block {
              padding: 15px 12px;
            }

            .block-text {
              font-size: 13px;
              margin-bottom: 15px;
            }

            .image-container {
              padding: 8px;
            }

            .language-switcher {
              top: 15px;
              right: 15px;
            }

            .lang-btn {
              padding: 6px 12px;
              font-size: 14px;
            }
          }

          @media (max-width: 600px) {
            .faq-header {
              padding: 12px 4vw 8px 4vw;
            }
            .faq-exit-btn {
              font-size: 14px;
              padding: 6px 16px;
              border-radius: 6px;
            }
          }
        `}</style>
      </div>
    </>
  );
}
