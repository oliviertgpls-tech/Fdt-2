import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test connexion
    await prisma.$connect()
    console.log('✅ Connexion Prisma OK')
    
    // Compte les users
    const userCount = await prisma.user.count()
    console.log('👥 Nombre d\'utilisateurs:', userCount)
    
    return NextResponse.json({ 
      success: true, 
      userCount,
      message: 'Base de données OK' 
    })
  } catch (error: any) {
    console.error('❌ Erreur Prisma:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}