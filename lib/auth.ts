import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  //adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
  sessionToken: {
    name: process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined
    }
  },
},
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🎯 SIGNIN CALLBACK:', {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        provider: account?.provider
      })
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('🔀 REDIRECT CALLBACK:', { url, baseUrl })
      
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      else if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl
    },
      async session({ session, token }) {
        console.log('🔵 SESSION JWT:', {
          tokenSub: token.sub,
          sessionEmail: session?.user?.email
        })
        
        if (session?.user && token.sub) {
          session.user.id = token.sub  // En JWT, l'ID est dans token.sub
        }
        
        return session
      },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}