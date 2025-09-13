import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/notebooks - Récupérer tous les carnets avec leurs recettes
export async function GET() {
  try {
    const notebooks = await prisma.notebook.findMany({
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/notebooks - Créer un nouveau carnet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const notebook = await prisma.notebook.create({
      data: {
        id: `notebook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: body.title,
        description: body.description
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
