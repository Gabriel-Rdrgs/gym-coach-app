'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [logoExists, setLogoExists] = useState(false);

  useEffect(() => {
    // Verificar se a logo existe
    const img = new Image();
    img.onload = () => setLogoExists(true);
    img.onerror = () => setLogoExists(false);
    img.src = '/logo.png';
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 border-b transition-all duration-300"
      style={{
        height: '80px',
        background: 'var(--bg-card)',
        borderColor: 'rgba(0, 217, 255, 0.2)',
        boxShadow: '0 2px 10px rgba(0, 217, 255, 0.1)',
      }}
    >
      <div className="h-full flex items-center justify-center px-8">
        {/* Logo e Título centralizado */}
        <div className="flex items-center gap-4">
          {logoExists && (
            <img 
              src="/logo.png" 
              alt="GYM COACH Logo" 
              className="h-12 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 0 10px rgba(0, 217, 255, 0.5))' }}
            />
          )}
          <h1
            className="text-2xl font-bold text-glow flex items-center gap-3"
            style={{
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '2px',
            }}
          >
            GYM COACH
          </h1>
        </div>
      </div>
    </header>
  );
}

