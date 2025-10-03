import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 Test envoi email...')
    console.log('RESEND_API_KEY présente:', !!process.env.RESEND_API_KEY)
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'noreply@resend.dev',
        to: 'oliviertgpls@gmail.com', // ← CHANGE PAR TON VRAI EMAIL
        subject: 'Test depuis mon app',
        html: '<p>Si tu reçois ça, Resend marche ! 🎉</p>'
      })
    })

    const data = await response.json()
    
    console.log('📬 Réponse Resend:', data)

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: data,
        status: response.status
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email envoyé !',
      data 
    })

  } catch (error: any) {
    console.error('❌ Erreur:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}