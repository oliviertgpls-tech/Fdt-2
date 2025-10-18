import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-server'
import { randomBytes } from 'crypto'

// POST /api/recipes/[id]/share - Créer un lien de partage
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🔒 Vérification auth
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    // Vérifier que la recette appartient au user
    const recipe = await prisma.recipe.findFirst({
      where: { 
        id: params.id,
        userId: user.id
      }
    })
    
    if (!recipe) {
      return NextResponse.json(
        { error: "Recette introuvable ou accès refusé" }, 
        { status: 404 }
      )
    }

    // Vérifier si un lien existe déjà pour cette recette
    const existingShare = await prisma.sharedRecipe.findFirst({
      where: {
        recipeId: params.id,
        ownerId: user.id
      }
    })

    if (existingShare) {
      // Retourner le lien existant
      return NextResponse.json({
        token: existingShare.token,
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${existingShare.token}`,
        createdAt: existingShare.createdAt,
        viewCount: existingShare.viewCount
      })
    }

    // Générer un token aléatoire sécurisé
    const token = randomBytes(16).toString('hex')

    // Créer le lien de partage
    const sharedRecipe = await prisma.sharedRecipe.create({
      data: {
        token,
        recipeId: params.id,
        ownerId: user.id
      }
    })

    return NextResponse.json({
      token: sharedRecipe.token,
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${sharedRecipe.token}`,
      createdAt: sharedRecipe.createdAt,
      viewCount: 0
    })
    
  } catch (error: any) {
    console.error('Erreur création lien partage:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/recipes/[id]/share - Supprimer un lien de partage
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    // Supprimer le lien de partage
    await prisma.sharedRecipe.deleteMany({
      where: {
        recipeId: params.id,
        ownerId: user.id
      }
    })

    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('Erreur suppression lien partage:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}