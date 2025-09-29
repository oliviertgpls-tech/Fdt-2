import { PrismaClient } from '@prisma/client'

console.log('🔌 PRISMA.TS CHARGÉ')
console.log('URL présente:', !!process.env.POSTGRES_PRISMA_URL)

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

console.log('✅ Prisma client créé')