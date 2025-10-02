import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

eexport const authOptions: NextAuthOptions = {
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
    async session({ session, user }) {
  console.log('🔵 SESSION CALLBACK:', {
    sessionUserEmail: session?.user?.email,
    dbUserEmail: user?.email,
    dbUserId: user?.id
  })
  
  // S'assurer que la session correspond bien au user en base
  if (session?.user && user) {
    session.user.id = user.id
    session.user.email = user.email  // FORCER l'email de la BDD
    session.user.name = user.name
    session.user.image = user.image
  }
  return session
},
  },
  events: {
    async signOut({ session, token }) {
      console.log('🚪 SIGNOUT EVENT:', { session, token })
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}