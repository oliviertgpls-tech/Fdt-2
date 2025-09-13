import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'API fonctionne !',
    env: {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasPrismaUrl: !!process.env.POSTGRES_PRISMA_URL
    }
  })
}
