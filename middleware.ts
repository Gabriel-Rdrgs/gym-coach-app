import { auth } from './src/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  // Rotas públicas
  const isPublic = pathname.startsWith('/login')
  
  // Se não está logado e tenta acessar rota protegida
  if (!req.auth && !isPublic) {
    const url = new URL('/login', req.url)
    return NextResponse.redirect(url)
  }
  
  // Se está logado e tenta acessar login, redireciona para dashboard
  if (req.auth && isPublic) {
    const url = new URL('/', req.url)
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
