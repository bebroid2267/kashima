'use client';

import React, { useState } from 'react';
import Footer from '../components/Footer';
import Image from 'next/image';
import chance from '@/../public/image.png';
import round from '@/../public/result.jpg';
import winner from '@/../public/light.jpg';
import Head from 'next/head';

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
  ru: FAQContent;
  ar: FAQContent;
}

const FAQ_CONTENT: FAQData = {
  ru: {
    title: "КАК ЭТО РАБОТАЕТ?",
    blocks: [
  {
        title: 'КАК УВЕЛИЧИТЬ СВОЙ ШАНС В KASHIF?',
        text: 'Чтобы увеличить свой шанс в Kashif, вам нужно быть активным — делать депозиты и играть регулярно. Чем больше вы играете и вносите депозиты, тем выше становятся ваши шансы. Регулярная активность помогает улучшить ваш потенциал выигрыша.',
        image: chance.src
  },
  {
        title: 'РАУНД НАЧАЛСЯ',
        text: 'Когда раунд начинается, молния ударяет, и множители начинают расти. Наблюдайте, как накапливается энергия и числа растут выше. Каждый момент приносит потенциал для больших выигрышей.',
        image: round.src
  },
  {
        title: 'РАУНД ПОБЕДИТЕЛЯ',
        text: "Вы в зоне прибыли, и множитель продолжает расти. Система компенсирует низкие множители (1.05x, 1.28x, 1.36x) более высокими. Просто подождите и наблюдайте, как увеличивается ваш потенциальный выигрыш.",
        image: winner.src
      }
    ]
  },
  ar: {
    title: "كيف يعمل؟",
    blocks: [
  {
        title: 'كيف تزيد فرصتك في KASHIF؟',
        text: 'لزيادة فرصتك في Kashif، عليك أن تكون نشطًا - قم بالإيداع واللعب بانتظام. كلما زاد لعبك وإيداعك، زادت فرصك. النشاط المنتظم يساعد في تحسين إمكانات الفوز.',
        image: chance.src
  },
  {
        title: 'الجولة جارية',
        text: 'عندما تبدأ الجولة، يضرب البرق وتبدأ المضاعفات في الارتفاع. راقب كيف تتراكم الطاقة وتنمو الأرقام. كل لحظة تحمل إمكانية تحقيق مكاسب أكبر.',
        image: round.src
  },
  {
        title: 'جولة الفائز جارية',
        text: 'أنت في منطقة الربح الآن، والمضاعف يستمر في النمو. يعوض النظام المضاعفات المنخفضة (1.05x، 1.28x، 1.36x) بمضاعفات أعلى. فقط انتظر وشاهد أرباحك المحتملة تزداد.',
        image: winner.src
      }
    ]
  }
};

export default function FAQ() {
  const [currentLang, setCurrentLang] = useState<'ru' | 'ar'>('ru');
  const content = FAQ_CONTENT[currentLang];

  return (
    <div className="faq-container">
      <Head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap" />
      </Head>
      <div className="language-switcher">
        <button 
          className={`lang-btn ${currentLang === 'ru' ? 'active' : ''}`}
          onClick={() => setCurrentLang('ru')}
        >
          РУС
        </button>
        <button 
          className={`lang-btn ${currentLang === 'ar' ? 'active' : ''}`}
          onClick={() => setCurrentLang('ar')}
    >
          عربي
        </button>
      </div>

      <div className={`content-wrapper ${currentLang === 'ar' ? 'rtl' : ''}`}>
        <h1 className="main-title">{content.title}</h1>
        
        <div className="faq-blocks">
          {content.blocks.map((block, idx) => (
            <div key={idx} className="faq-block-wrapper">
              <div className="block-title-wrapper">
                <h2 className="block-title">{block.title}</h2>
              </div>
              <div className="faq-block">
                <p className="block-text">{block.text}</p>
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

      <Footer />

      <style jsx global>{`
        .faq-container {
          min-height: 100vh;
          width: 100%;
          background: #07101e;
          font-family: 'Orbitron', sans-serif;
          padding: 20px;
          position: relative;
          overflow-x: hidden;
        }

        .language-switcher {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 10px;
          z-index: 10;
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
          margin-bottom: 40px;
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
      `}</style>
    </div>
  );
}
