import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    // Test de connexion simple
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({ 
      success: true, 
      message: 'Base de données connectée !' 
    })
  } catch (error) {
    console.error('Erreur BDD:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Problème de connexion BDD' 
    }, { status: 500 })
  }
}
