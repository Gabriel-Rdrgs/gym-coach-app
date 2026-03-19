'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('GlobalError:', error.message, error.digest)
  }, [error])

  const isAuthError =
    error.message?.includes('unexpected response') ||
    error.message?.toLowerCase().includes('session') ||
    error.message?.toLowerCase().includes('auth')

  return (
    <html lang="pt-BR">
      <body style={{
        margin: 0,
        fontFamily: 'system-ui, sans-serif',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#e2e8f0',
        padding: 24,
      }}>
        <div style={{
          maxWidth: 440,
          textAlign: 'center',
          background: 'rgba(30, 41, 59, 0.8)',
          padding: 32,
          borderRadius: 16,
          border: '1px solid rgba(71, 85, 105, 0.5)',
        }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>
            Algo deu errado
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>
            {isAuthError
              ? 'Problema ao carregar a sessão. Confira as variáveis de ambiente na Vercel (NEXTAUTH_URL, AUTH_SECRET, DATABASE_URL).'
              : error.message || 'Erro inesperado.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/login"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: '#3b82f6',
                color: '#fff',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Ir para o login
            </Link>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '12px 24px',
                background: 'rgba(71, 85, 105, 0.8)',
                color: '#e2e8f0',
                border: '1px solid rgba(100, 116, 139, 0.5)',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Tentar de novo
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
