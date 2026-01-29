// src/app/login/actions.ts
'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

export async function handleDemoLogin() {
  try {
    console.log('🚀 Iniciando login demo...') // Debug
    
    await signIn('credentials', {
      email: 'gabriel@gymcoach.com',
      password: '123456',
      redirectTo: '/',
    })
    
    console.log('✅ Login bem-sucedido!') // Debug
  } catch (error) {
    console.error('❌ Erro no login:', error) // Debug
    
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Credenciais inválidas' }
        default:
          return { error: 'Algo deu errado' }
      }
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
    if (error instanceof AuthError) {
      return { error: 'Erro ao fazer login com Google' }
    }
    throw error
  }
}
