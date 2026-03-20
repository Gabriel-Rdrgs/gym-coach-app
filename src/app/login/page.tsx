"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Email ou senha incorretos. Verifique suas credenciais.")
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--bg-dark)' }}
    >
      {/* Efeito de fundo: círculos de brilho */}
      <div
        className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0, 217, 255, 0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-md relative z-10">

        {/* Logo e título */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">💪</div>
          <h1
            className="text-5xl font-bold mb-3 text-glow"
            style={{
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '3px',
            }}
          >
            GYM COACH
          </h1>
          <p
            className="text-base font-light tracking-widest uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Seu Personal Trainer Digital
          </p>
        </div>

        {/* Card do formulário */}
        <div
          className="card-neon"
          style={{ padding: '48px' }}
        >
          <h2
            className="text-2xl font-bold mb-8 text-center"
            style={{ color: 'var(--text-primary)' }}
          >
            Entrar na sua conta
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--accent-primary)' }}
              >
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
                className="input-neon w-full"
              />
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--accent-primary)' }}
              >
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
                className="input-neon w-full"
              />
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div
                className="p-4 rounded-lg text-sm text-center"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                }}
              >
                {error}
              </div>
            )}

            {/* Botão de entrar */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span
                    className="h-5 w-5 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
                  />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px" style={{ background: 'rgba(0, 217, 255, 0.2)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>ou</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(0, 217, 255, 0.2)' }} />
          </div>

          {/* Link para cadastro */}
          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Não tem uma conta?{" "}
            <Link
              href="/signup"
              className="font-semibold transition-all hover:underline"
              style={{ color: 'var(--accent-secondary)' }}
            >
              Criar conta grátis →
            </Link>
          </p>
        </div>

        {/* Rodapé */}
        <p
          className="text-center text-xs mt-8"
          style={{ color: 'var(--text-muted)', opacity: 0.5 }}
        >
          © {new Date().getFullYear()} Gym Coach · Todos os direitos reservados
        </p>

      </div>
    </div>
  )
}
