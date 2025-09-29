import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🗑️ Début du reset complet de la base...')
    
    // Supprimer dans l'ordre (à cause des foreign keys)
    await prisma.bookRecipe.deleteMany({})
    console.log('✅ BookRecipe supprimés')
    
    await prisma.notebookRecipe.deleteMany({})
    console.log('✅ NotebookRecipe supprimés')
    
    await prisma.book.deleteMany({})
    console.log('✅ Books supprimés')
    
    await prisma.notebook.deleteMany({})
    console.log('✅ Notebooks supprimés')
    
    await prisma.recipe.deleteMany({})
    console.log('✅ Recipes supprimées')
    
    await prisma.session.deleteMany({})
    console.log('✅ Sessions supprimées')
    
    await prisma.account.deleteMany({})
    console.log('✅ Accounts supprimés')
    
    await prisma.user.deleteMany({})
    console.log('✅ Users supprimés')
    
    await prisma.verificationToken.deleteMany({})
    console.log('✅ VerificationTokens supprimés')
    
    console.log('🎉 Base de données complètement nettoyée !')
    
    return NextResponse.json({ 
      success: true, 
      message: '✅ Base de données réinitialisée avec succès ! Vous pouvez maintenant vous reconnecter.' 
    })
  } catch (error: any) {
    console.error('❌ Erreur reset:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// Permettre aussi le GET pour tester facilement dans le navigateur
export async function GET() {
  return POST()
}