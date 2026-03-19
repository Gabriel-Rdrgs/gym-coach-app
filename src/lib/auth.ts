import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import type { AuthOptions } from "next-auth"

export const authOptions: AuthOptions = {
  // Sem PrismaAdapter — usamos JWT puro, sem salvar sessão no banco
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Valida se os campos chegaram
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // 2. Busca o usuário no banco pelo email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        // 3. Se não encontrou ou não tem senha, nega acesso
        if (!user || !user.passwordHash) {
          return null
        }

        // 4. Compara a senha digitada com o hash armazenado
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        // 5. Se a senha não bate, nega acesso
        if (!isValid) {
          return null
        }

        // 6. Retorna o objeto do usuário — NextAuth vai usar isso para montar o token
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],

  // Redireciona para /login se não autenticado
  pages: {
    signIn: "/login",
  },

  // Sessão baseada em JWT (token no cookie) — não precisa de banco para sessões
  session: {
    strategy: "jwt",
    // Token expira em 30 dias
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    // Chamado quando o token JWT é criado/atualizado
    async jwt({ token, user }) {
      // Na primeira vez (login), "user" existe — guardamos o id no token
      if (user) {
        token.sub = user.id
      }
      return token
    },

    // Chamado sempre que o frontend pede a sessão (useSession, getServerSession)
    async session({ session, token }) {
      // Injeta o id do usuário (que veio do token) no objeto session
      if (token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },

  // Logs de debug apenas em desenvolvimento
  debug: process.env.NODE_ENV === "development",
}

// Handler para a rota /api/auth/[...nextauth]
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

// Função auxiliar para Server Components — busca a sessão atual no servidor
export async function auth() {
  const { getServerSession } = await import("next-auth")
  return getServerSession(authOptions)
}
