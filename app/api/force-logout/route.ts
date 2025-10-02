import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Récupérer la session actuelle
    const session = await getServerSession(authOptions)
    
    if (session?.user?.id) {
      // Supprimer TOUTES les sessions de cet utilisateur
      await prisma.session.deleteMany({
        where: { userId: session.user.id }
      })
    }
    
    // Créer une réponse de redirection
    const response = NextResponse.redirect(new URL('/', request.url))  
    
    // Supprimer tous les cookies NextAuth
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