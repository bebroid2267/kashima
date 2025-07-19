'use client';

import React from 'react';
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

const FAQ_CONTENT: FAQContent = {
  title: "HOW DOES IT WORK?",
  blocks: [
    {
      title: 'HOW TO INCREASE YOUR CHANCE IN KASHIF?',
      text: 'To increase your chance in Kashif, you need to be active - make deposits and play regularly. The more you play and deposit, the higher your chances become. Regular activity helps improve your winning potential.',
      image: chance.src
    },
    {
      title: 'ROUND STARTED',
      text: 'When the round starts, lightning strikes and multipliers begin to rise. Watch as energy accumulates and numbers grow higher. Every moment brings potential for bigger wins.',
      image: round.src
    },
    {
      title: 'WINNER ROUND IN PROGRESS',
      text: 'You are in the profit zone now, and the multiplier continues to grow. The system compensates low multipliers (1.05x, 1.28x, 1.36x) with higher ones. Just wait and watch your potential winnings increase.',
      image: winner.src
    }
  ]
};

export default function FAQ() {
  return (
    <div className="faq-container">
      <Head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap" />
      </Head>

      <div className="content-wrapper">
        <h1 className="main-title">{FAQ_CONTENT.title}</h1>
        
        <div className="faq-blocks">
          {FAQ_CONTENT.blocks.map((block, idx) => (
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


        }
      `}</style>
    </div>
  );
}
