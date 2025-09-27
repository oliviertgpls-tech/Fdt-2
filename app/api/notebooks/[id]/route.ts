import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/notebooks/[id] - Mettre à jour un carnet
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description } = body
    
    const notebook = await prisma.notebook.update({
      where: { id: params.id },
      data: {
        title: title || undefined,
        description: description || undefined,
        updatedAt: new Date()
      }
    })
    
    // Récupérer les recettes associées pour la réponse
    const notebookWithRecipes = await prisma.notebook.findUnique({
      where: { id: params.id },
      include: {
        recipes: {
          orderBy: { position: 'asc' }
        }
      }
    })
    
    return NextResponse.json({
      id: notebook.id,
      title: notebook.title,
      description: notebook.description,
      createdAt: notebook.createdAt.getTime(),
      updatedAt: notebook.updatedAt.getTime(),
      recipeIds: notebookWithRecipes?.recipes.map(r => r.recipeId) || []
    })
  } catch (error: any) {
    console.error('❌ Erreur PUT notebook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/notebooks/[id] - Supprimer un carnet
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Prisma va automatiquement supprimer les NotebookRecipe grâce au onDelete: Cascade
    await prisma.notebook.delete({
      where: { id: params.id }
    })
    
    console.log('🗑️ Carnet supprimé:', params.id)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Erreur DELETE notebook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
