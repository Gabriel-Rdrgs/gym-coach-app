// src/lib/auth.ts - NextAuth v4 corrigido
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"  // ← MUDANÇA: @next-auth/ não @auth/
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"  // ← ADICIONAR bcryptjs no package.json se não existir
import type { AuthOptions } from "next-auth"
import { getServerSession } from "next-auth"

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user?.passwordHash) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
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
  debug: process.env.NODE_ENV === "development",
}

const nextAuthHandler = NextAuth(authOptions)

export const handlers = {
  GET: nextAuthHandler,
  POST: nextAuthHandler,
}

export async function auth() {
  try {
    return await getServerSession(authOptions)
  } catch (e) {
    console.error("[auth] getServerSession failed:", e)
    return null
  }
}
