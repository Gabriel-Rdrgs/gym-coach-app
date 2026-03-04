// src/lib/auth.ts - NextAuth v4 (getServerSession + handler)
import NextAuth from "next-auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import type { AuthOptions } from "next-auth"

export const authOptions: AuthOptions = {
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
        if (
          credentials?.email === "gabriel@gymcoach.com" &&
          credentials?.password === "123456"
        ) {
          const user = await prisma.user.findUnique({
            where: { email: "gabriel@gymcoach.com" },
          })
          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            }
          }
        }
        return null
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
    async session({ session, token, user }) {
      if (user) {
        session.user.id = user.id
      } else if (token?.sub) {
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

/** Sessão no servidor (RSC, API routes). NextAuth v4 usa getServerSession. */
export async function auth() {
  return getServerSession(authOptions)
}

/** Redireciona para a página de sign-in do provider (NextAuth v4 não expõe signIn no servidor). */
export function signIn(
  provider: string,
  options?: { redirectTo?: string }
) {
  const callbackUrl = options?.redirectTo ?? "/"
  redirect(
    `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`
  )
}
