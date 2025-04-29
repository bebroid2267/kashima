'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  return (
    <footer
      style={{
        color: '#7ecbff',
        fontSize: 12,
        textAlign: 'center',
        width: '100%',
        padding: '0',
        position: 'fixed',
        left: 0,
        bottom: 0,
        background: 'rgba(10, 20, 40, 0.98)',
        boxShadow: '0 -2px 16px #07101e99',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 64,
        borderTop: '2px solid #193a5e',
      }}
    >
      {/* Home Button */}
      <Link
        href="/"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          color: pathname === '/' ? '#fff' : '#38e0ff',
          flex: 1,
          background: pathname === '/' ? 'rgba(56,224,255,0.12)' : 'none',
          borderTop: pathname === '/' ? '3px solid #38e0ff' : '3px solid transparent',
          fontWeight: pathname === '/' ? 700 : 500,
          transition: 'all 0.2s',
          height: '100%',
        }}
      >
        <span style={{ fontSize: 28, marginBottom: 2, filter: pathname === '/' ? 'drop-shadow(0 0 8px #38e0ff)' : 'none' }}>▶️</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>HOME</span>
      </Link>
      {/* Help Button */}
      <Link
        href="/faq"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          color: pathname.startsWith('/faq') ? '#fff' : '#ffe066',
          flex: 1,
          background: pathname.startsWith('/faq') ? 'rgba(255,224,102,0.10)' : 'none',
          borderTop: pathname.startsWith('/faq') ? '3px solid #ffe066' : '3px solid transparent',
          fontWeight: pathname.startsWith('/faq') ? 700 : 500,
          transition: 'all 0.2s',
          height: '100%',
        }}
      >
        <span style={{ fontSize: 28, marginBottom: 2, filter: pathname.startsWith('/faq') ? 'drop-shadow(0 0 8px #ffe066)' : 'none' }}>❓</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>HELP</span>
      </Link>
    </footer>
  );
} 