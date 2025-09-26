import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-server'

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const recipes = await prisma.recipe.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(recipes)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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
        userId: user.id,
        isFromExternalUrl: body.isFromExternalUrl || false,
      }
    })
    
    return NextResponse.json(recipe)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}