import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Chercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        accounts: {
          select: {
            provider: true
          }
        }
      }
    })

    if (!user) {
      // Email pas en base → OK pour magic link
      return NextResponse.json({ 
        exists: false,
        canUseMagicLink: true
      })
    }

    // Vérifier si l'utilisateur a un compte Google
    const hasGoogleAccount = user.accounts.some(acc => acc.provider === 'google')

    if (hasGoogleAccount) {
      // User existe avec Google → forcer Google
      return NextResponse.json({ 
        exists: true,
        hasGoogleAccount: true,
        canUseMagicLink: false,
        message: 'Cet email est déjà associé à un compte Google. Veuillez vous connecter avec Google.'
      })
    }

    // User existe mais sans Google (cas rare, magic link précédent)
    return NextResponse.json({ 
      exists: true,
      hasGoogleAccount: false,
      canUseMagicLink: true
    })

  } catch (error: any) {
    console.error('Erreur check-email:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}