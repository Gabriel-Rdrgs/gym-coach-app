// src/app/login/actions.ts
'use server'

import { signIn } from '@/lib/auth'

type AuthErrorLike = { type?: string; code?: string }

export async function handleDemoLogin(): Promise<void> {
  try {
    await signIn('credentials', { redirectTo: '/' })
  } catch (error) {
    console.error('❌ Erro no login:', error)
    const authErr = error as AuthErrorLike
    if (authErr?.type === 'CredentialsSignin' || authErr?.code === 'CredentialsSignin') {
      throw new Error('Credenciais inválidas')
    }
    if (authErr?.type || authErr?.code) {
      throw new Error('Algo deu errado')
    }
    throw error
  }
}

export async function handleGoogleLogin(): Promise<void> {
  try {
    await signIn('google', { redirectTo: '/' })
  } catch (error) {
    const authErr = error as AuthErrorLike
    if (authErr?.type || authErr?.code) {
      throw new Error('Erro ao fazer login com Google')
    }
    throw error
  }
}
