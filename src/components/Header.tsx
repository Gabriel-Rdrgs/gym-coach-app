'use client';

import { useEffect, useState } from 'react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function Header({ onToggleSidebar, sidebarOpen: propSidebarOpen }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(propSidebarOpen ?? true);

  useEffect(() => {
    if (propSidebarOpen !== undefined) {
      setSidebarOpen(propSidebarOpen);
    }
  }, [propSidebarOpen]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 border-b transition-all duration-300"
      style={{
        height: '80px',
        background: 'var(--bg-card)',
        borderColor: 'rgba(0, 217, 255, 0.2)',
        boxShadow: '0 2px 10px rgba(0, 217, 255, 0.1)',
        marginLeft: sidebarOpen ? '256px' : '80px',
      }}
    >
      <div className="h-full flex items-center px-8 relative">
        {/* Botão à esquerda */}
        <div className="absolute left-8">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg border transition-all hover:scale-110"
              style={{
                borderColor: 'var(--accent-primary)',
                color: 'var(--accent-primary)',
                background: sidebarOpen ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
              }}
              title={sidebarOpen ? 'Recolher sidebar' : 'Expandir sidebar'}
            >
              <span className="text-lg">{sidebarOpen ? '◀' : '▶'}</span>
            </button>
          )}
        </div>
        
        {/* Logo e Título centralizado */}
        <div className="flex-1 flex justify-center items-center gap-4">
          <img 
            src="/logo.png" 
            alt="GYM COACH Logo" 
            className="h-12 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 10px rgba(0, 217, 255, 0.5))' }}
            onError={(e) => {
              // Fallback se a imagem não existir
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <h1
            className="text-2xl font-bold text-glow flex items-center gap-3"
            style={{
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '2px',
            }}
          >
            💪GYM COACH🏋️
          </h1>
        </div>
      </div>
    </header>
  );
}

