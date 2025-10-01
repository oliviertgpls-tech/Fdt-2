import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🗑️ Suppression de toutes les sessions...')
    
    await prisma.session.deleteMany({})
    
    console.log('✅ Sessions supprimées')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sessions nettoyées. Reconnectez-vous.' 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}