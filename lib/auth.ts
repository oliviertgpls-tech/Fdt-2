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
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "database",
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
    async session({ session, user }) {
      console.log('🔵 SESSION CALLBACK DÉTAILS:', {
        sessionEmail: session?.user?.email,
        sessionName: session?.user?.name,
        dbUserId: user?.id,
        dbUserEmail: user?.email,
        dbUserName: user?.name
      })
      
      if (session?.user && user) {
        session.user.id = user.id
        session.user.email = user.email
        session.user.name = user.name
        session.user.image = user.image
      }
      
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}