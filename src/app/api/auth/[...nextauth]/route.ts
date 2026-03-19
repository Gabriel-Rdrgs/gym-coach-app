import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

// Este handler conecta as opções de auth (providers, adapter, etc.)
// à rota /api/auth/[...nextauth] da App Router.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
