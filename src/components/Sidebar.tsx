'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Treinos', href: '/workouts', icon: '🏋️' },
  { name: 'Exercícios', href: '/exercises', icon: '💪' },
  { name: 'Métricas', href: '/metrics', icon: '📊' },
  { name: 'Progresso', href: '/progress', icon: '📈' },
  { name: 'Evolução', href: '/progress/exercise', icon: '🔬' },
  { name: 'PRs', href: '/prs', icon: '🏆' },
  { name: 'Programas', href: '/programs', icon: '📅' },
  { name: 'Dieta', href: '/diet', icon: '🥗' },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const main = document.querySelector('main');
    if (main) {
      if (isOpen) {
        main.classList.add('sidebar-open');
        main.classList.remove('sidebar-closed');
      } else {
        main.classList.add('sidebar-closed');
        main.classList.remove('sidebar-open');
      }
    }
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-20 left-4 z-50 lg:hidden p-3 rounded-lg border-2 transition-all hover:scale-110"
        style={{
          borderColor: 'var(--accent-primary)',
          background: 'var(--bg-card)',
          color: 'var(--accent-primary)',
          boxShadow: '0 0 15px rgba(0, 217, 255, 0.3)',
        }}
        title="Abrir menu"
      >
        <span className="text-2xl">☰</span>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed z-50 flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-20'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          top: '80px',
          left: 0,
          bottom: 0,
          height: 'calc(100vh - 80px)',
          background: 'var(--bg-card)',
          borderRight: '2px solid var(--accent-primary)',
          boxShadow: '4px 0 20px rgba(0, 217, 255, 0.2)',
        }}
      >
        {/* Navigation Items */}
        <nav className="p-6 space-y-4 overflow-y-auto flex-1" style={{ paddingBottom: '160px' }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  sidebar-nav-item flex items-center gap-4 px-5 py-4 rounded-lg
                  transition-all duration-200
                  ${active ? 'active' : ''}
                `}
                style={{
                  background: active
                    ? 'rgba(0, 217, 255, 0.15)'
                    : 'rgba(0, 217, 255, 0.05)',
                  border: active ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  color: active ? 'var(--accent-primary)' : 'var(--text-primary)',
                }}
              >
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                {isOpen && (
                  <span className="font-semibold text-base whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div
          className="absolute bottom-0 left-0 right-0 border-t"
          style={{
            borderColor: 'rgba(0, 217, 255, 0.2)',
            background: 'var(--bg-card)',
          }}
        >
          {/* Link de Perfil */}
          <Link
            href="/profile"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-4 px-5 py-4 transition-all hover:bg-purple-500/10"
            style={{
              color: isActive('/profile')
                ? 'var(--accent-secondary)'
                : 'var(--text-muted)',
              borderBottom: '1px solid rgba(0, 217, 255, 0.1)',
            }}
          >
            <span className="text-2xl flex-shrink-0">👤</span>
            {isOpen && (
              <span className="font-semibold text-sm whitespace-nowrap">
                Perfil
              </span>
            )}
          </Link>

          {/* Botão de Toggle */}
          <button
            onClick={onToggle}
            className="w-full p-4 flex items-center justify-center gap-3 transition-all hover:bg-cyan-500/10"
            style={{ color: 'var(--accent-primary)' }}
            title={isOpen ? 'Recolher sidebar' : 'Expandir sidebar'}
          >
            <span className="text-xl flex-shrink-0">{isOpen ? '◀' : '▶'}</span>
            {isOpen && (
              <span className="text-sm font-semibold whitespace-nowrap">
                Recolher
              </span>
            )}
          </button>

          {/* Versão */}
          {isOpen && (
            <div
              className="px-4 pb-3 text-center text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              v1.0.0
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
