import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    })
    
    return NextResponse.json({ 
      count: sessions.length,
      sessions: sessions.map(s => ({
        userEmail: s.user.email,
        expires: s.expires,
        isExpired: s.expires < new Date()
      }))
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
