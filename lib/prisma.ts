// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { neon, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

declare global {
  // Hot reload fix for Next.js (évite de recréer le client à chaque refresh en dev)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// ✅ Utiliser fetch comme transport pour Neon (compatible avec Prisma adapter)
neonConfig.poolQueryViaFetch = true

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  const connection = neon(process.env.DATABASE_URL!)
  const adapter = new PrismaNeon(connection)
  prisma = new PrismaClient({ adapter })
} else {
  if (!global.prisma) {
    const connection = neon(process.env.DATABASE_URL!)
    const adapter = new PrismaNeon(connection)
    global.prisma = new PrismaClient({ adapter })
  }
  prisma = global.prisma
}

export default prisma