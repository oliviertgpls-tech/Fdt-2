import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-server'

// PUT /api/recipes/[id] - Modifier une recette
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🔒 Vérification auth
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    
    // 🎯 Vérifier que la recette appartient au user
    const existingRecipe = await prisma.recipe.findFirst({
      where: { 
        id: params.id,
        userId: user.id // ← SÉCURITÉ : vérifier ownership
      }
    })
    
    if (!existingRecipe) {
      return NextResponse.json(
        { error: "Recette introuvable ou accès refusé" }, 
        { status: 404 }
      )
    }
    
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
    console.error('Erreur PUT recipe:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/recipes/[id] - Supprimer une recette
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🔒 Vérification auth
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }
    
    // 🎯 Vérifier ownership avant suppression
    const existingRecipe = await prisma.recipe.findFirst({
      where: { 
        id: params.id,
        userId: user.id
      }
    })
    
    if (!existingRecipe) {
      return NextResponse.json(
        { error: "Recette introuvable ou accès refusé" }, 
        { status: 404 }
      )
    }
    
    await prisma.recipe.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erreur DELETE recipe:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
