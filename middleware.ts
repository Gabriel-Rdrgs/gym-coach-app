// src/middleware.ts
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Proteger todas as rotas EXCETO:
     * - /login (página de login)
     * - /signup (página de cadastro)
     * - /api/auth/* (rotas de autenticação)
     * - /_next/static (arquivos estáticos do Next.js)
     * - /_next/image (otimização de imagens)
     * - /favicon.ico (ícone do site)
     */
    "/((?!login|signup|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
