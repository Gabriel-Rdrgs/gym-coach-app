"use client"
import { signIn, getProviders } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const [providers, setProviders] = useState<any>(null)

  useEffect(() => {
    const setUpProviders = async () => {
      const providers = await getProviders()
      setProviders(providers)
    }
    setUpProviders()
  }, [])

  const handleDemoLogin = async () => {
    const result = await signIn("credentials", {
      email: "gabriel@gymcoach.com",
      password: "123456",
      redirect: false // ← ISSO impede reload
    })
    
    if (result?.ok) {
      window.location.href = "/" // ← Redireciona manualmente
    } else {
      alert("Erro no login demo!")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            💪 Gym Coach
          </h2>
          <p className="mt-2 text-gray-600">Escolha como entrar</p>
        </div>
        
        <div className="space-y-4">
          {/* Demo (CORRIGIDO) */}
          <button
            onClick={handleDemoLogin}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            🚀 Entrar Demo (Gabriel)
          </button>
          
          {/* Google */}
          <button
            onClick={() => signIn("google")}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            🌐 Google
          </button>
        </div>
        
        <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded-lg">
          Demo: gabriel@gymcoach.com / 123456
        </div>
      </div>
    </div>
  )
}
