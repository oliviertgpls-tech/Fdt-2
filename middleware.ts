import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Routes publiques (accessibles sans connexion)
  const isPublicPath = 
    path === '/' ||
    path.startsWith('/auth/') ||
    path.startsWith('/api/auth/') ||
    path.startsWith('/api/admin/') ||
    path.startsWith('/api/force-git s') ||
    path.startsWith('/_next/') ||
    path === '/favicon.ico'
  
  // Laisser passer les routes publiques
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Vérifier le cookie de session
  const sessionToken = 
    request.cookies.get('__Secure-next-auth.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value
  
  // Si pas de session token sur route protégée → redirect signin
  if (!sessionToken) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(signInUrl)
  }
  
  // Session token présent → laisser passer
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Matcher toutes les routes SAUF :
     * - api/auth (NextAuth)
     * - _next/static (fichiers statiques)
     * - _next/image (images Next.js)
     * - favicon.ico
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}