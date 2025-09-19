import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-server'

// GET /api/recipes - Récupérer toutes les recettes DU USER CONNECTÉ
export async function GET() {
  try {
    // 🔒 Vérification auth
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    // 🎯 Filtrage par userId
    const recipes = await prisma.recipe.findMany({
      where: { userId: user.id }, // ← NOUVEAU : filtre par user
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(recipes)
  } catch (error: any) {
    console.error('Erreur GET recipes:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/recipes - Créer une nouvelle recette POUR LE USER CONNECTÉ
export async function POST(request: NextRequest) {
  try {
    // 🔒 Vérification auth
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    
    const recipe = await prisma.recipe.create({
      data: {
        id: `r-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        ingredients: body.ingredients || [],
        steps: body.steps || '',
        author: body.author,
        prepMinutes: body.prepMinutes,
        servings: body.servings,
        tags: body.tags || [],
        userId: user.id // 🎯 NOUVEAU : assigne au user connecté
      }
    })
    
    return NextResponse.json(recipe)
  } catch (error: any) {
    console.error('Erreur POST recipes:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
