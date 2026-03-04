import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Chave usada no JWT (NextAuth v4 usa NEXTAUTH_SECRET; Auth.js usa AUTH_SECRET)
const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPublic =
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth')

  let token: unknown = null
  try {
    token = secret ? await getToken({ req, secret }) : null
  } catch (e) {
    console.error('[middleware] getToken failed:', e)
  }

  if (isPublic) {
    if (token && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Executa em todas as rotas exceto API interna do Next, estáticos e arquivos de mídia
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
