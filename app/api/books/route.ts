import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-server'

// GET /api/books - Récupérer tous les livres DU USER CONNECTÉ
export async function GET() {
  try {
    // 🔒 Vérification auth
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const books = await prisma.book.findMany({
      where: { userId: user.id }, // 🎯 Filtrage par user
      include: {
        recipes: {
          include: {
            recipe: true
          },
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Reformater pour correspondre au format attendu par le front
    const formattedBooks = books.map(book => ({
      id: book.id,
      title: book.title,
      description: book.description,
      status: book.status,
      coverImageUrl: book.coverImageUrl || undefined,
      createdAt: book.createdAt.getTime(),
      updatedAt: book.updatedAt.getTime(),
      recipeIds: book.recipes.map(r => r.recipeId)
    }))
    
    return NextResponse.json(formattedBooks)
  } catch (error: any) {
    console.error('Erreur GET books:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/books - Créer un nouveau livre POUR LE USER CONNECTÉ
export async function POST(request: NextRequest) {
  try {
    // 🔒 Vérification auth
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { title, description, recipeIds = [], coverImageUrl } = body
    
    console.log('🚀 Création livre:', { title, recipeIds: recipeIds.length })
    
    // Créer le livre d'abord
    const book = await prisma.book.create({
      data: {
        id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title,
        description: description || null,
        status: 'draft',
        coverImageUrl: coverImageUrl || null,
        userId: user.id // 🎯 AJOUTÉ : assigne au user connecté
      }
    })
    
    // Puis ajouter les recettes avec leur position
    if (recipeIds.length > 0) {
      const bookRecipes = recipeIds.map((recipeId: string, index: number) => ({
        id: `br-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 6)}`,
        bookId: book.id,
        recipeId: recipeId,
        position: index
      }))
      
      await prisma.bookRecipe.createMany({
        data: bookRecipes
      })
    }
    
    console.log('✅ Livre créé:', book.id)
    
    return NextResponse.json({
      id: book.id,
      title: book.title,
      description: book.description,
      status: book.status,
      coverImageUrl: book.coverImageUrl,
      createdAt: book.createdAt.getTime(),
      updatedAt: book.updatedAt.getTime(),
      recipeIds: recipeIds
    })
  } catch (error: any) {
    console.error('❌ Erreur POST books:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
