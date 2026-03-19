import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import type { AuthOptions } from "next-auth"

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
        console.log('🔍 AUTH:', { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        
        console.log('👤 USER:', !!user, user?.email);

        if (!user?.passwordHash) {
          console.log('❌ NO HASH');
          return null;
        }
        
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        
        console.log('✅ VALID?', isValid);

        if (!isValid) return null;

        console.log('🎉 LOGIN SUCCESS');
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
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
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function auth() {
  // getServerSession precisa do handler
  const { getServerSession } = await import("next-auth")
  return getServerSession(authOptions)
}
