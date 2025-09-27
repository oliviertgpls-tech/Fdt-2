// scripts/test-neon.ts
import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import 'dotenv/config' // pour charger .env

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaNeon(pool)
  const prisma = new PrismaClient({ adapter })

  // Test simple : requête brute
  const now = await prisma.$queryRawUnsafe<{ now: string }[]>("SELECT NOW()")

  console.log("Connexion OK ✅, serveur Neon répond :", now[0].now)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error("❌ Erreur de connexion :", e)
  process.exit(1)
})