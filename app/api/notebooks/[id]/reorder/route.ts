import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/notebooks/[id]/reorder - Réorganiser l'ordre des recettes dans un carnet
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { recipeIds } = body;
    
    if (!Array.isArray(recipeIds)) {
      return NextResponse.json({ error: 'recipeIds doit être un array' }, { status: 400 });
    }
    
    // Mettre à jour la position de chaque NotebookRecipe
    const updates = recipeIds.map((recipeId, index) =>
      prisma.notebookRecipe.updateMany({
        where: {
          notebookId: params.id,
          recipeId: recipeId
        },
        data: {
          position: index
        }
      })
    );
    
    await prisma.$transaction(updates);
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('❌ Erreur reorder notebook recipes:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du réordonnement' },
      { status: 500 }
    );
  }
}