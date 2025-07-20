'use client';

import React from 'react';
import Footer from '../components/Footer';
import Image from 'next/image';
import chanceImg from '@/../public/chance2.png';
import koefImg from '@/../public/koef2.png';
import energyImg from '@/../public/energy.png';
import depositImg from '@/../public/dep2.png';
import aviatorImg from '@/../public/aviator.png';
import messageImg from '@/../public/help2.png';

interface FAQBlock {
  title: string;
  text: string;
  image: string;
}

interface FAQContent {
  title: string;
  blocks: FAQBlock[];
}

const FAQ_CONTENT = {
  title: "F.A.Q. — Frequently Asked Questions",
  blocks: [
    {
      title: "What does the AI Vision button do?",
      text: "The AI Vision button launches an artificial intelligence algorithm that makes a personalized prediction for the next round of the Aviator game. Each prediction includes:\n\n💡 A specific coefficient\n🧠 A justification based on this particular coefficient\n⚠️ A warning about the risk level (high, medium or safe)\n📌 1 prediction = 1 energy unit. Use it wisely.",
      image: ""
    },
    {
      title: "Where is the prediction displayed?",
      text: "Your current prediction is displayed in the center of the screen in the upper part. You immediately see the coefficient, explanation and probability of it being realized.",
      image: koefImg.src
    },
    {
      title: "What does the Aviator button do?",
      text: "The Aviator button opens the Aviator game section on the 1xbet website.\n📲 You can use Kashif AI and Aviator simultaneously, switching between windows — it's convenient and fast.",
      image: aviatorImg.src
    },
    {
      title: "How does energy work?",
      text: "⚡ Every day you log into the app, you receive 1 energy unit (updated every 24 hours)\n🔁 1 energy = 1 prediction\n⛔ If energy is depleted, you can replenish it with a deposit",
      image: energyImg.src
    },
    {
      title: "What is Winning Probability?",
      text: "This is your prediction accuracy percentage. It:\n\n📈 Increases automatically after each deposit\n🔐 Is calculated by the AI algorithm\n💸 The higher the percentage, the more accurate your prediction and consequently you start earning more. AI starts predicting coefficients better and helps you analyze charts.",
      image: chanceImg.src
    },
    {
      title: "How does the Make Deposit button work?",
      text: "Press to access the deposits section. Deposit:\n- Increases your chances of accurate predictions\n- Increases energy in the program for new AI Vision launches",
      image: depositImg.src
    },
    {
      title: "Help Me button",
      text: "If you encounter problems or want to learn more, write to me",
      image: messageImg.src
    },
    {
      title: "The essentials:",
      text: "- Use AI Vision for predictions\n- Switch between Kashif AI and Aviator, it's convenient 😉\n- Monitor your energy and accuracy levels\n- Make deposits to increase your chances",
      image: ""
    }
  ]
};

// Removed Arabic translations - using English only

export default function FAQ() {
  const content = FAQ_CONTENT;

  // Exit function
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
        </div>
      </div>
      <div className="faq-container">
        <div className="content-wrapper">
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

        <Footer />

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

          .faq-exit-btn {
            background: none;
            color: #fff;
            font-weight: 700;
            font-size: 18px;
            border: none;
            cursor: pointer;
            transition: color 0.3s;
          }

          .faq-exit-btn:hover {
            color: #38e0ff;
          }

          .content-wrapper {
            max-width: 1000px;
            margin: 60px auto 0;
            padding: 20px;
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
              padding: 35px 4vw 8px 4vw;
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
