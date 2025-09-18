import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
