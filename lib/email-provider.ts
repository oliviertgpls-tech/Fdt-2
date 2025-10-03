import { Resend } from 'resend'
import type { EmailConfig } from 'next-auth/providers/email'

const resend = new Resend(process.env.RESEND_API_KEY)

export function ResendProvider(options: Partial<EmailConfig>): EmailConfig {
  return {
    id: 'email',
    type: 'email',
    name: 'Email',
    from: options.from || process.env.EMAIL_FROM!,
    maxAge: 24 * 60 * 60, // 24h
    async sendVerificationRequest({ identifier: email, url, provider }) {
      try {
        console.log('📧 Envoi magic link à:', email)
        
        const result = await resend.emails.send({
          from: provider.from!,
          to: email,
          subject: 'Connexion à Food Memories',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">🍳 Food Memories</h1>
                </div>
                
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                  <h2 style="color: #1f2937; margin-top: 0;">Connexion à votre compte</h2>
                  
                  <p style="font-size: 16px; color: #4b5563;">
                    Cliquez sur le bouton ci-dessous pour vous connecter à votre compte Food Memories :
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${url}" style="background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                      Se connecter
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #6b7280;">
                    Ce lien expire dans 24 heures et ne peut être utilisé qu'une seule fois.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                  
                  <p style="font-size: 12px; color: #9ca3af;">
                    Si vous n'avez pas demandé cette connexion, vous pouvez ignorer cet email en toute sécurité.
                  </p>
                </div>
              </body>
            </html>
          `
        })
        
        console.log('✅ Email envoyé avec succès:', result)
        
      } catch (error) {
        console.error('❌ Erreur envoi email:', error)
        throw error
      }
    },
    options
  }
}
