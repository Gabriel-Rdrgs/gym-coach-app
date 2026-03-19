"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()

  // Estado do formulário
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Estado de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Submissão do formulário principal
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault() // Impede o reload da página
    setLoading(true)
    setError(null)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Não redireciona automaticamente — tratamos o resultado aqui
    })

    if (result?.error) {
      // NextAuth retorna "CredentialsSignin" quando o authorize retorna null
      setError("Email ou senha incorretos. Verifique suas credenciais.")
      setLoading(false)
      return
    }

    // Login bem-sucedido — redireciona para o dashboard
    router.push("/")
    router.refresh() // Força o Server Component (page.tsx) a re-renderizar com a sessão
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            💪 Gym Coach
          </h2>
          <p className="mt-2 text-gray-600">Entre com sua conta</p>
        </div>

        {/* Formulário principal */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Mensagem de erro */}
          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {/* Separador */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>
        {/* Link para cadastro */}
        <p className="text-center text-sm text-gray-600">
          Não tem uma conta?{" "}
          <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
