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
  callbacks: {
    session: async ({ session, user }) => {
      console.log('🔵 SESSION CALLBACK:', { session, user })
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  // 🔥 ACTIVATION DEBUG
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('❌ NextAuth ERROR:', code, metadata)
    },
    warn(code) {
      console.warn('⚠️ NextAuth WARN:', code)
    },
    debug(code, metadata) {
      console.log('🐛 NextAuth DEBUG:', code, metadata)
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}