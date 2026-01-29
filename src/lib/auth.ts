// src/lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔐 Tentando login com:', credentials?.email) // Debug
        
        if (
          credentials?.email === "gabriel@gymcoach.com" &&
          credentials?.password === "123456"
        ) {
          const user = await prisma.user.findUnique({
            where: { email: "gabriel@gymcoach.com" }
          })
          
          if (user) {
            console.log('✅ Usuário encontrado:', user.id) // Debug
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            }
          }
        }
        
        console.log('❌ Credenciais inválidas') // Debug
        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt", // ✅ IMPORTANTE: JWT para Credentials
  },
  callbacks: {
    async session({ session, token, user }) {
      // Para Google OAuth (usa adapter)
      if (user) {
        session.user.id = user.id
      }
      // Para Credentials (usa JWT)
      else if (token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  debug: true, // ✅ Ativar debug temporariamente
})
