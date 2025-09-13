import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PUT /api/recipes/[id] - Modifier une recette
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const recipe = await prisma.recipe.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        ingredients: body.ingredients || [],
        steps: body.steps || '',
        author: body.author,
        prepMinutes: body.prepMinutes,
        servings: body.servings,
        tags: body.tags || [],
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json(recipe)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/recipes/[id] - Supprimer une recette
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.recipe.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
