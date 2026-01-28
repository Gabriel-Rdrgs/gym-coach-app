import { PrismaAdapter } from "@next-auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // ✅ TESTE RÁPIDO
    Credentials({
      name: "Gym Coach (Demo)",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email === "gabriel@gymcoach.com" && credentials?.password === "123456") {
          return { 
            id: "gabriel123", 
            name: "Gabriel Rodrigues", 
            email: "gabriel@gymcoach.com" 
          }
        }
        throw new Error("Email ou senha inválidos")
      }
    }),
    
    // ✅ GOOGLE (quando configurar)
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" }
}

export default authOptions
