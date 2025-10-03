import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    EmailProvider({
      server: {
        host: "localhost",
        port: 1025,
        auth: { user: "", pass: "" }
      },
      from: process.env.EMAIL_FROM!,
      // 🔥 Override de la fonction d'envoi
      async sendVerificationRequest({ identifier: email, url, provider }) {
        console.log('📧 === DÉBUT sendVerificationRequest ===')
        console.log('📮 Destinataire:', email)
        console.log('🔗 URL:', url)
        
        try {
          const result = await resend.emails.send({
            from: provider.from as string,
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
          
          console.log('✅ Email envoyé avec succès!')
          console.log('📊 Résultat:', result)
          
        } catch (error: any) {
          console.error('❌ Erreur envoi email:', error)
          throw new Error(`Impossible d'envoyer l'email: ${error.message}`)
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (!user) {
        console.error("❌ SESSION: user introuvable en BDD")
        throw new Error("Session invalide: user non trouvé")
      }
      
      if (session?.user) {
        session.user.id = user.id
        session.user.email = user.email ?? session.user.email
        session.user.name = user.name ?? session.user.name
        session.user.image = user.image ?? session.user.image
      }
      
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
}