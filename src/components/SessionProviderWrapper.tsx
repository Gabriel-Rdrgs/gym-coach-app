'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { SessionProvider } from 'next-auth/react'

interface Props {
  children: ReactNode
}

/**
 * Só monta o SessionProvider após o client estar hidratado.
 * Evita que o fetch de /api/auth/session na primeira carga quebre a página
 * quando a API ainda está em cold start ou retorna erro na Vercel.
 */
export default function SessionProviderWrapper({ children }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  )
}
