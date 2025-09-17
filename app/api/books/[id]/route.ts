import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PUT /api/books/[id] - Modifier un livre
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, coverImageUrl, status } = body
    
    const book = await prisma.book.update({
      where: { id: params.id },
      data: {
        title: title || undefined,
        description: description || undefined,
        coverImageUrl: coverImageUrl || undefined,
        status: status || undefined,
        updatedAt: new Date()
      }
    })
    
    // Récupérer les recettes associées pour la réponse
    const bookWithRecipes = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        recipes: {
          orderBy: { position: 'asc' }
        }
      }
    })
    
    return NextResponse.json({
      id: book.id,
      title: book.title,
      description: book.description,
      status: book.status,
      coverImageUrl: book.coverImageUrl,
      createdAt: book.createdAt.getTime(),
      updatedAt: book.updatedAt.getTime(),
      recipeIds: bookWithRecipes?.recipes.map(r => r.recipeId) || []
    })
  } catch (error: any) {
    console.error('❌ Erreur PUT book:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/books/[id] - Supprimer un livre
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Prisma va automatiquement supprimer les BookRecipe grâce au onDelete: Cascade
    await prisma.book.delete({
      where: { id: params.id }
    })
    
    console.log('🗑️ Livre supprimé:', params.id)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Erreur DELETE book:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
