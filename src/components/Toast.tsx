'use client';

import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastComponent({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getColor = () => {
    switch (toast.type) {
      case 'success':
        return 'var(--accent-success)';
      case 'error':
        return 'var(--accent-warning)';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return 'var(--accent-primary)';
      default:
        return 'var(--accent-primary)';
    }
  };

  return (
    <div
      className="card-neon mb-4 p-4 flex items-center gap-3 animate-slide-in"
      style={{
        border: `2px solid ${getColor()}`,
        boxShadow: `0 0 20px ${getColor()}40`,
        minWidth: '300px',
        maxWidth: '500px',
      }}
    >
      <span className="text-2xl">{getIcon()}</span>
      <p className="flex-1" style={{ color: 'var(--text-primary)' }}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-xl hover:scale-110 transition-all"
        style={{ color: 'var(--text-muted)' }}
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Listener global para toasts
    const handleToast = (event: CustomEvent<{ message: string; type: ToastType }>) => {
      const newToast: Toast = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message: event.detail.message,
        type: event.detail.type,
      };
      setToasts((prev) => [...prev, newToast]);
    };

    window.addEventListener('showToast' as any, handleToast as EventListener);

    return () => {
      window.removeEventListener('showToast' as any, handleToast as EventListener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-24 right-4 z-50"
      style={{ pointerEvents: 'none' }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  );
}

// Hook para usar toasts
export function useToast() {
  const showToast = (message: string, type: ToastType = 'info') => {
    const event = new CustomEvent('showToast', {
      detail: { message, type },
    });
    window.dispatchEvent(event);
  };

  return {
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    warning: (message: string) => showToast(message, 'warning'),
    info: (message: string) => showToast(message, 'info'),
  };
}

