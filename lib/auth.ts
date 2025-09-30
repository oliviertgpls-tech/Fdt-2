import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🎯 SIGNIN CALLBACK:', {
        userId: user.id,
        userEmail: user.email,
        provider: account?.provider
      })
      return true // Autoriser la connexion
    },
    async redirect({ url, baseUrl }) {
      console.log('🔀 REDIRECT CALLBACK:', { url, baseUrl })
      
      // Si URL relative, retourner avec baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Si même origine, retourner l'URL
      else if (new URL(url).origin === baseUrl) {
        return url
      }
      // Sinon retourner baseUrl
      return baseUrl
    },
    async session({ session, user }) {
      console.log('🔵 SESSION CALLBACK')
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}