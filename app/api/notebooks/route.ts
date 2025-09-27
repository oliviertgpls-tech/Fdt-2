import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-server'

// GET /api/notebooks - Récupérer tous les carnets DU USER CONNECTÉ
export async function GET() {
  try {
    // 🔒 Vérification auth
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const notebooks = await prisma.notebook.findMany({
      where: { userId: user.id }, // 🎯 Filtrage par user
      include: {
        recipes: {
          include: {
            recipe: true
          },
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Reformater pour correspondre à l'ancien format
    const formattedNotebooks = notebooks.map(notebook => ({
      id: notebook.id,
      title: notebook.title,
      description: notebook.description,
      createdAt: notebook.createdAt.getTime(),
      updatedAt: notebook.updatedAt.getTime(),
      recipeIds: notebook.recipes.map(r => r.recipeId)
    }))
    
    return NextResponse.json(formattedNotebooks)
  } catch (error: any) {
    console.error('Erreur GET notebooks:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/notebooks - Créer un nouveau carnet POUR LE USER CONNECTÉ
export async function POST(request: NextRequest) {
  try {
    // 🔒 Vérification auth
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    
    const notebook = await prisma.notebook.create({
      data: {
        id: `notebook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: body.title,
        description: body.description,
        userId: user.id // 🎯 NOUVEAU : assigne au user connecté
      }
    })
    
    return NextResponse.json({
      id: notebook.id,
      title: notebook.title,
      description: notebook.description,
      createdAt: notebook.createdAt.getTime(),
      updatedAt: notebook.updatedAt.getTime(),
      recipeIds: []
    })
  } catch (error: any) {
    console.error('Erreur POST notebooks:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
