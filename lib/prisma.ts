// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

declare global {
  // Hot reload fix for Next.js
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  const pool = new Pool({ connectionString: process.env.POSTGRES_PRISMA_URL })  // ✅ CHANGÉ
  const adapter = new PrismaNeon(pool)
  prisma = new PrismaClient({ adapter })
} else {
  if (!global.prisma) {
    const pool = new Pool({ connectionString: process.env.POSTGRES_PRISMA_URL })  // ✅ CHANGÉ
    const adapter = new PrismaNeon(pool)
    global.prisma = new PrismaClient({ adapter })
  }
  prisma = global.prisma
}

export default prisma