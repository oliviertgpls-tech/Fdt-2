import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🗑️ RESET COMPLET - Début...')
    
    // 1. Supprimer toutes les sessions
    const deletedSessions = await prisma.session.deleteMany({})
    console.log(`✅ ${deletedSessions.count} sessions supprimées`)
    
    // 2. Supprimer tous les accounts (liens OAuth)
    const deletedAccounts = await prisma.account.deleteMany({})
    console.log(`✅ ${deletedAccounts.count} accounts supprimés`)
    
    // 3. Lister les users avant suppression (pour info)
    const users = await prisma.user.findMany({
      select: { email: true }
    })
    console.log('👥 Users qui vont être supprimés:', users.map(u => u.email))
    
    // 4. Supprimer toutes les données utilisateurs
    await prisma.bookRecipe.deleteMany({})
    await prisma.notebookRecipe.deleteMany({})
    await prisma.recipe.deleteMany({})
    await prisma.book.deleteMany({})
    await prisma.notebook.deleteMany({})
    
    // 5. Supprimer tous les users
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`✅ ${deletedUsers.count} users supprimés`)
    
    // 6. Verification tokens
    await prisma.verificationToken.deleteMany({})
    
    console.log('🎉 RESET COMPLET TERMINÉ !')
    
    return NextResponse.json({ 
      success: true, 
      message: '✅ Base de données complètement nettoyée. Tout le monde doit se reconnecter.',
      deletedSessions: deletedSessions.count,
      deletedAccounts: deletedAccounts.count,
      deletedUsers: deletedUsers.count
    })
  } catch (error: any) {
    console.error('❌ Erreur reset:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    warning: '⚠️ Cette action va SUPPRIMER tous les utilisateurs et toutes les données.',
    instruction: 'Utilisez POST pour confirmer le reset complet.'
  })
}