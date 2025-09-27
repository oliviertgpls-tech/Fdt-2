import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  return POST(); // Réutilise la logique POST
}

export async function POST() {
  try {
    // Créer les tables avec du SQL brut (plus simple que Prisma migrate)
    
    // 1. Table des recettes
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Recipe" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "imageUrl" TEXT,
        "ingredients" TEXT[] DEFAULT '{}',
        "steps" TEXT NOT NULL DEFAULT '',
        "author" TEXT,
        "prepMinutes" INTEGER,
        "servings" TEXT,
        "tags" TEXT[] DEFAULT '{}',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 2. Table des carnets
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Notebook" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 3. Table de liaison carnet-recettes
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "NotebookRecipe" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "notebookId" TEXT NOT NULL,
        "recipeId" TEXT NOT NULL,
        "position" INTEGER NOT NULL DEFAULT 0,
        UNIQUE("notebookId", "recipeId")
      )
    `

    // 4. Table des livres
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Book" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 5. Table de liaison livre-recettes
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "BookRecipe" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bookId" TEXT NOT NULL,
        "recipeId" TEXT NOT NULL,
        "position" INTEGER NOT NULL DEFAULT 0,
        UNIQUE("bookId", "recipeId")
      )
    `

    // Test simple sans COUNT pour éviter le BigInt
    await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tables créées avec succès ! 🎉',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Erreur migration:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      message: 'Erreur lors de la création des tables'
    }, { status: 500 })
  }
}
