// src/app/login/actions.ts
'use server'

import { signIn } from '@/lib/auth'

type AuthErrorLike = { type?: string; code?: string }

export async function handleDemoLogin() {
  try {
    console.log('🚀 Iniciando login demo...') // Debug

    await signIn('credentials', {
      redirectTo: '/',
    })

    console.log('✅ Login bem-sucedido!') // Debug
  } catch (error) {
    console.error('❌ Erro no login:', error) // Debug

    const authErr = error as AuthErrorLike
    if (authErr?.type === 'CredentialsSignin' || authErr?.code === 'CredentialsSignin') {
      return { error: 'Credenciais inválidas' }
    }
    if (authErr?.type || authErr?.code) {
      return { error: 'Algo deu errado' }
    }
    throw error
  }
}

export async function handleGoogleLogin() {
  try {
    await signIn('google', {
      redirectTo: '/',
    })
  } catch (error) {
    const authErr = error as AuthErrorLike
    if (authErr?.type || authErr?.code) {
      return { error: 'Erro ao fazer login com Google' }
    }
    throw error
  }
}
