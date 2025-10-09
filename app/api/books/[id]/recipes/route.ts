import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/books/[id]/recipes - Ajouter une recette à un livre
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { recipeId } = body
    
    // Vérifier si la recette est déjà dans le livre
    const existing = await prisma.bookRecipe.findUnique({
      where: {
        bookId_recipeId: {
          bookId: params.id,
          recipeId: recipeId
        }
      }
    })
    
    if (existing) {
      return NextResponse.json({ error: 'Recette déjà dans le livre' }, { status: 400 })
    }
    
    // Trouver la prochaine position
    const lastPosition = await prisma.bookRecipe.findFirst({
      where: { bookId: params.id },
      orderBy: { position: 'desc' }
    })
    
    const newPosition = (lastPosition?.position ?? -1) + 1
    
    // Ajouter la recette
    await prisma.bookRecipe.create({
      data: {
        id: `br-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        bookId: params.id,
        recipeId: recipeId,
        position: newPosition
      }
    })
    
    return NextResponse.json({ success: true, position: newPosition })
  } catch (error: any) {
    console.error('❌ Erreur POST book recipe:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/books/[id]/recipes - Supprimer une recette d'un livre
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('recipeId');
    
    if (!recipeId) {
      return NextResponse.json({ error: 'recipeId manquant' }, { status: 400 });
    }
    
    // Chercher le BookRecipe
    const bookRecipe = await prisma.bookRecipe.findUnique({
      where: {
        bookId_recipeId: {
          bookId: params.id,
          recipeId: recipeId
        }
      }
    });
    
    if (!bookRecipe) {
      // Pas de BookRecipe trouvé - peut-être un ancien livre
      return NextResponse.json({ 
        error: 'Cette recette n\'est pas dans ce livre' 
      }, { status: 404 });
    }
    
    // Supprimer la relation BookRecipe
    await prisma.bookRecipe.delete({
      where: {
        bookId_recipeId: {
          bookId: params.id,
          recipeId: recipeId
        }
      }
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('❌ Erreur DELETE book recipe:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}