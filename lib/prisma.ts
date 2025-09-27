// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { neon } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

declare global {
  // Trick to avoid multiple Prisma instances in Next.js (Hot Reload in dev)
  // @ts-ignore
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  // In production (Vercel), use Neon serverless client
  const connection = neon(process.env.DATABASE_URL!)
  const adapter = new PrismaNeon(connection)
  prisma = new PrismaClient({ adapter })
} else {
  // In dev, reuse the same client to avoid exhausting Neon connections
  if (!global.prisma) {
    const connection = neon(process.env.DATABASE_URL!)
    const adapter = new PrismaNeon(connection)
    global.prisma = new PrismaClient({ adapter })
  }
  prisma = global.prisma
}

export default prisma