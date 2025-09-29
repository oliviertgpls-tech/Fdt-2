import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

// Configuration pour Neon serverless
neonConfig.webSocketConstructor = ws

declare global {
  var prisma: PrismaClient | undefined
}

// Fonction pour créer le client Prisma avec l'adapter Neon
function createPrismaClient() {
  const connectionString = process.env.POSTGRES_PRISMA_URL
  
  if (!connectionString) {
    throw new Error('POSTGRES_PRISMA_URL manquante dans les variables d\'environnement')
  }

  // Créer le pool Neon
  const pool = new Pool({ connectionString })
  
  // Créer l'adaptateur
  const adapter = new PrismaNeon(pool)
  
  // Créer le client Prisma avec l'adaptateur
  return new PrismaClient({ adapter })
}

// Singleton pattern pour éviter trop de connexions
export const prisma = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}