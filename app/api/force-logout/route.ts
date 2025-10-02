import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {  // ← Corrigé ici
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user?.id) {
      await prisma.session.deleteMany({
        where: { userId: session.user.id }
      })
    }
    
    const response = NextResponse.redirect(new URL('/', request.url))  // ← Et ici (request minuscule)
    
    response.cookies.delete('next-auth.session-token')
    response.cookies.delete('__Secure-next-auth.session-token')
    response.cookies.delete('next-auth.csrf-token')
    response.cookies.delete('__Host-next-auth.csrf-token')
    response.cookies.delete('next-auth.callback-url')
    response.cookies.delete('__Secure-next-auth.callback-url')
    
    return response
  } catch (error: any) {
    console.error('Erreur logout:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}