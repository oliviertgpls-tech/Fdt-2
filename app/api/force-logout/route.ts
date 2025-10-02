import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user?.id) {
      await prisma.session.deleteMany({
        where: { userId: session.user.id }
      })
    }
    
    // Redirection vers page statique (pas de React, pas de SessionProvider)
    return NextResponse.redirect(new URL('/logout.html', request.url))
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}