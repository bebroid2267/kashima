import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { Metadata, Viewport } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Kashif AI",
  description: "Kashif AI - votre assistant intelligent pour les prévisions",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/192.jpg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/16.png" />
        <style>{`
          html {
            height: 100%;
          }
          
          body {
            min-height: 100%;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }

          * {
            -webkit-tap-highlight-color: transparent;
          }
        `}</style>
      </head>      
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}