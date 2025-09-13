import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/recipes - Récupérer toutes les recettes
export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(recipes)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/recipes - Créer une nouvelle recette
export async function POST(request: NextRequest) {
  try {
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
        tags: body.tags || []
      }
    })
    
    return NextResponse.json(recipe)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
