"import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }
    
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }
    
    // Supprimer TOUTES les sessions de cet utilisateur
    const deleted = await prisma.session.deleteMany({
      where: { userId: user.id }
    })
    
    return NextResponse.json({ 
      success: true,
      email,
      deletedSessions: deleted.count
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}