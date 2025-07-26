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
  title: "F.A.Q. — Domande Frequenti",
  blocks: [
    {
      title: "Cosa fa il pulsante AI Vision?",
      text: "Il pulsante AI Vision avvia un algoritmo di intelligenza artificiale che fa una previsione personalizzata per il prossimo round del gioco Aviator. Ogni previsione include:\n\n💡 Un coefficiente specifico\n🧠 Una giustificazione basata su questo particolare coefficiente\n⚠️ Un avviso sul livello di rischio (alto, medio o sicuro)\n📌 1 previsione = 1 unità di energia. Usala saggiamente.",
      image: ""
    },
    {
      title: "Dove viene visualizzata la previsione?",
      text: "La tua previsione attuale viene visualizzata al centro dello schermo nella parte superiore. Vedi immediatamente il coefficiente, la spiegazione e la probabilità che si realizzi.",
      image: koefImg.src
    },
    {
      title: "Cosa fa il pulsante Aviator?",
      text: "Il pulsante Aviator apre la sezione del gioco Aviator sul sito web 1xbet.\n📲 Puoi usare Oracolo AI e Aviator simultaneamente, passando tra le finestre — è comodo e veloce.",
      image: aviatorImg.src
    },
    {
      title: "Come funziona l'energia?",
      text: "⚡ Ogni giorno che accedi all'app, ricevi 1 unità di energia (aggiornata ogni 24 ore)\n🔁 1 energia = 1 previsione\n⛔ Se l'energia si esaurisce, puoi ricaricarla con un deposito",
      image: energyImg.src
    },
    {
      title: "Cos'è la Probabilità di Vincita?",
      text: "Questa è la percentuale di accuratezza delle tue previsioni. Essa:\n\n📈 Aumenta automaticamente dopo ogni deposito\n🔐 È calcolata dall'algoritmo AI\n💸 Più alta è la percentuale, più accurate sono le tue previsioni e di conseguenza inizi a guadagnare di più. L'AI inizia a prevedere meglio i coefficienti e ti aiuta ad analizzare i grafici.",
      image: chanceImg.src
    },
    {
      title: "Come funziona il pulsante Effettua Deposito?",
      text: "Premi per accedere alla sezione depositi. Il deposito:\n- Aumenta le tue possibilità di previsioni accurate\n- Aumenta l'energia nel programma per nuovi lanci di AI Vision",
      image: depositImg.src
    },
    {
      title: "Pulsante Aiutami",
      text: "Se incontri problemi o vuoi saperne di più, scrivimi",
      image: messageImg.src
    },
    {
      title: "L'essenziale:",
      text: "- Usa AI Vision per le previsioni\n- Passa tra Oracolo AI e Aviator, è comodo 😉\n- Monitora i tuoi livelli di energia e accuratezza\n- Effettua depositi per aumentare le tue possibilità",
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
          <button className="faq-exit-btn" onClick={handleExit}>Esci</button>
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
