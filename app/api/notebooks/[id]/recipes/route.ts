import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/notebooks/[id]/recipes - Ajouter une recette à un carnet
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { recipeId } = body
    
    // Vérifier si la recette est déjà dans le carnet
    const existing = await prisma.notebookRecipe.findUnique({
      where: {
        notebookId_recipeId: {
          notebookId: params.id,
          recipeId: recipeId
        }
      }
    })
    
    if (existing) {
      return NextResponse.json({ error: 'Recette déjà dans le carnet' }, { status: 400 })
    }
    
    // Trouver la prochaine position
    const lastPosition = await prisma.notebookRecipe.findFirst({
      where: { notebookId: params.id },
      orderBy: { position: 'desc' }
    })
    
    const newPosition = (lastPosition?.position ?? -1) + 1
    
    // Ajouter la recette
    await prisma.notebookRecipe.create({
      data: {
        id: `nr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        notebookId: params.id,
        recipeId: recipeId,
        position: newPosition
      }
    })
    
    return NextResponse.json({ success: true, position: newPosition })
  } catch (error: any) {
    console.error('❌ Erreur POST notebook recipe:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/notebooks/[id]/recipes - Supprimer une recette d'un carnet
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get('recipeId')
    
    if (!recipeId) {
      return NextResponse.json({ error: 'recipeId manquant' }, { status: 400 })
    }
    
    await prisma.notebookRecipe.delete({
      where: {
        notebookId_recipeId: {
          notebookId: params.id,
          recipeId: recipeId
        }
      }
    })
    
    // Réorganiser les positions (optionnel, mais plus propre)
    const remainingRecipes = await prisma.notebookRecipe.findMany({
      where: { notebookId: params.id },
      orderBy: { position: 'asc' }
    })
    
    // Mettre à jour les positions pour qu'elles soient continues
    for (let i = 0; i < remainingRecipes.length; i++) {
      await prisma.notebookRecipe.update({
        where: { id: remainingRecipes[i].id },
        data: { position: i }
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Erreur DELETE notebook recipe:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
