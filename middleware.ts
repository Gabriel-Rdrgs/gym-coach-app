import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

console.log('🚀 MIDDLEWARE RODANDO!')

const PUBLIC_PATHS = ['/login', '/signup', '/api/auth']

export async function middleware(req: NextRequest) {
  console.log('🚀 MIDDLEWARE RODANDO!')
  const { pathname } = req.nextUrl

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
  let token = null

  if (secret) {
    try {
      token = await getToken({ req, secret })
    } catch (error) {
      console.error('[middleware] getToken error:', error)
    }
  } else {
    console.error('[middleware] NEXTAUTH_SECRET/AUTH_SECRET não definida')
  }

  // Rotas públicas
  if (isPublic) {
    // Usuário logado indo para /login → manda pro dashboard
    if (token && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // Rotas protegidas sem token → manda para /login
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Rotas protegidas com token → libera
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
