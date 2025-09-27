// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

declare global {
  // Trick to avoid multiple Prisma instances in Next.js (Hot Reload in dev)
  // @ts-ignore
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  // In production (Vercel), create a new client with Neon adapter
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaNeon(pool)
  prisma = new PrismaClient({ adapter })
} else {
  // In dev, reuse the same client to avoid exhausting Neon connections
  if (!global.prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaNeon(pool)
    global.prisma = new PrismaClient({ adapter })
  }
  prisma = global.prisma
}

export default prisma